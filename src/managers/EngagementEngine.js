import config from '../config/config.js';
import logger from '../utils/logger.js';
import AIService from '../services/AIService.js';
import DataStore from '../data/DataStore.js';
import { sleep, shuffleArray, containsKeyword } from '../utils/helpers.js';

class EngagementEngine {
  constructor(browserController) {
    this.browser = browserController;
    this.aiService = new AIService();
    this.dataStore = new DataStore();
    this.repliedTweets = new Set();
  }

  async findReplyTargets(limit = 5) {
    try {
      logger.info('Finding reply targets', {
        component: 'EngagementEngine',
        action: 'findReplyTargets'
      });

      await this.browser.goto('https://twitter.com/home');
      await sleep(2000);
      await this.browser.scroll(500);
      await sleep(1000);

      const tweets = await this.browser.page.evaluate((selectors) => {
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        const results = [];

        tweetElements.forEach((tweet, index) => {
          if (index >= 15) return;

          const textElement = tweet.querySelector('[data-testid="tweetText"]');
          const text = textElement ? textElement.innerText : '';

          const authorElement = tweet.querySelector('[data-testid="User-Name"]');
          const author = authorElement ? authorElement.innerText.split('@')[1]?.split('·')[0]?.trim() : '';

          const tweetLink = tweet.querySelector('a[href*="/status/"]');
          const tweetId = tweetLink ? tweetLink.href.split('/status/')[1]?.split('?')[0] : null;

          if (text && tweetId && text.length > 10) {
            results.push({
              text,
              author,
              tweetId
            });
          }
        });

        return results;
      }, config.selectors);

      const filtered = tweets.filter(tweet => 
        containsKeyword(tweet.text, config.content.developerKeywords) &&
        !this.repliedTweets.has(tweet.tweetId)
      );

      logger.info('Found reply targets', {
        component: 'EngagementEngine',
        total: tweets.length,
        filtered: filtered.length
      });

      return shuffleArray(filtered).slice(0, limit);
    } catch (error) {
      logger.error('Failed to find reply targets', {
        component: 'EngagementEngine',
        error: error.message
      });
      return [];
    }
  }

  async replyToTweet(targetTweet, dryRun = false) {
    try {
      logger.info('Replying to tweet', {
        component: 'EngagementEngine',
        action: 'replyToTweet',
        tweetId: targetTweet.tweetId,
        dryRun
      });

      const sentiment = await this.aiService.analyzeSentiment(targetTweet.text);
      const replyText = await this.aiService.generateReply(targetTweet.text, {
        replyType: sentiment
      });

      if (dryRun) {
        logger.info('[DRY RUN] Would reply', {
          component: 'EngagementEngine',
          target: targetTweet.text,
          reply: replyText
        });
        return { success: true };
      }

      const tweetUrl = `https://twitter.com/${targetTweet.author}/status/${targetTweet.tweetId}`;
      await this.browser.goto(tweetUrl);
      await sleep(2000);

      const replyButton = await this.browser.page.$('[data-testid="reply"]');
      if (replyButton) {
        await replyButton.click();
        await sleep(1500);

        await this.browser.typeText(
          config.selectors.tweetTextarea,
          replyText
        );

        await sleep(1000);

        const postButton = await this.browser.page.$(config.selectors.tweetButton);
        if (postButton) {
          await postButton.click();
          await sleep(2000);

          this.repliedTweets.add(targetTweet.tweetId);
          this.dataStore.addReply({
            targetTweetId: targetTweet.tweetId,
            targetAuthor: targetTweet.author,
            replyText
          });

          logger.info('Reply posted successfully', {
            component: 'EngagementEngine',
            tweetId: targetTweet.tweetId
          });

          return { success: true };
        }
      }

      throw new Error('Reply button or post button not found');
    } catch (error) {
      logger.error('Failed to reply to tweet', {
        component: 'EngagementEngine',
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  async engageBatch(count = 3, dryRun = false) {
    try {
      const targets = await this.findReplyTargets(count);
      const results = [];

      for (const target of targets) {
        const result = await this.replyToTweet(target, dryRun);
        results.push(result);
        await sleep(config.engagement.minReplyInterval * 60 * 1000);
      }

      return results;
    } catch (error) {
      logger.error('Engagement batch failed', {
        component: 'EngagementEngine',
        error: error.message
      });
      return [];
    }
  }
}

export default EngagementEngine;
