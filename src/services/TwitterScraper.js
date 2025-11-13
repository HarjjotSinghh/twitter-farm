import config from '../config/config.js';
import logger from '../utils/logger.js';
import AIService from '../services/AIService.js';
import MediaHandler from '../services/MediaHandler.js';
import DataStore from '../data/DataStore.js';
import { containsKeyword, shuffleArray } from '../utils/helpers.js';

class TwitterScraper {
  constructor(browserController) {
    this.browser = browserController;
    this.aiService = new AIService();
    this.mediaHandler = new MediaHandler();
    this.dataStore = new DataStore();
  }

  async scrapeTrendingTweets(limit = 10) {
    try {
      logger.info('Scraping trending tweets', {
        component: 'TwitterScraper',
        action: 'scrapeTrendingTweets',
        limit
      });

      await this.browser.goto('https://twitter.com/explore');
      await this.browser.scroll(500);

      const tweets = await this.browser.page.evaluate(() => {
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        const results = [];

        tweetElements.forEach((tweet, index) => {
          if (index >= 20) return;

          const textElement = tweet.querySelector('[data-testid="tweetText"]');
          const text = textElement ? textElement.innerText : '';

          const authorElement = tweet.querySelector('[data-testid="User-Name"]');
          const author = authorElement ? authorElement.innerText.split('@')[1]?.split('·')[0]?.trim() : '';

          const images = [];
          tweet.querySelectorAll('img[src*="media"]').forEach(img => {
            if (img.src && !img.src.includes('profile')) {
              images.push(img.src);
            }
          });

          const likesElement = tweet.querySelector('[data-testid="like"]');
          const likesText = likesElement ? likesElement.getAttribute('aria-label') || '0' : '0';
          const likes = parseInt(likesText.match(/\d+/)?.[0] || '0');

          if (text && text.length > 10) {
            results.push({
              text,
              author,
              mediaUrls: images,
              likes,
              retweets: 0
            });
          }
        });

        return results;
      });

      const filtered = tweets.filter(tweet => 
        containsKeyword(tweet.text, config.content.developerKeywords) &&
        !containsKeyword(tweet.text, config.content.excludedTopics) &&
        tweet.likes >= config.content.minEngagementThreshold
      );

      logger.info('Scraped tweets', {
        component: 'TwitterScraper',
        total: tweets.length,
        filtered: filtered.length
      });

      return shuffleArray(filtered).slice(0, limit);
    } catch (error) {
      logger.error('Failed to scrape tweets', {
        component: 'TwitterScraper',
        error: error.message
      });
      return [];
    }
  }

  async generateContentFromTrends() {
    try {
      const tweets = await this.scrapeTrendingTweets(5);
      
      if (tweets.length === 0) {
        logger.warn('No suitable tweets found', { component: 'TwitterScraper' });
        return [];
      }

      const generatedContent = [];

      for (const tweet of tweets) {
        try {
          const variation = await this.aiService.generateTweetVariation(tweet.text, {
            topic: 'software development'
          });

          let mediaLocalPaths = [];
          if (tweet.mediaUrls && tweet.mediaUrls.length > 0) {
            const mediaResults = await this.mediaHandler.downloadMultipleMedia(
              tweet.mediaUrls.slice(0, 1)
            );
            mediaLocalPaths = mediaResults.map(m => m.filepath);
          }

          const contentItem = this.dataStore.addToContentQueue({
            text: variation,
            mediaUrls: tweet.mediaUrls,
            mediaLocalPaths,
            sourceAuthor: tweet.author,
            topicTags: ['developer', 'software'],
            engagementScore: tweet.likes
          });

          generatedContent.push(contentItem);
        } catch (error) {
          logger.error('Failed to generate content from tweet', {
            component: 'TwitterScraper',
            error: error.message
          });
        }
      }

      logger.info('Content generation completed', {
        component: 'TwitterScraper',
        count: generatedContent.length
      });

      return generatedContent;
    } catch (error) {
      logger.error('Content generation failed', {
        component: 'TwitterScraper',
        error: error.message
      });
      return [];
    }
  }
}

export default TwitterScraper;
