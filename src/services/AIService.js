import OpenAI from 'openai';
import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * AI Service - Handles content generation using OpenAI API
 */
class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.ai.apiKey
    });
  }

  /**
   * Generate tweet content variations based on source tweet
   */
  async generateTweetVariation(sourceTweet, context = {}) {
    try {
      logger.info('Generating tweet variation', {
        component: 'AIService',
        action: 'generateTweetVariation',
        sourceLength: sourceTweet.length
      });

      const prompt = this.buildTweetPrompt(sourceTweet, context);

      const response = await this.client.chat.completions.create({
        model: config.ai.model,
        temperature: config.ai.temperature,
        max_tokens: 100,
        messages: [
          {
            role: 'system',
            content: 'You are a software developer with years of experience. Create engaging, authentic tweets about software development, programming, and tech. Keep tweets concise, relatable, and human-like. Avoid being overly formal or salesy.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const generatedText = response.choices[0].message.content.trim();
      
      logger.info('Tweet variation generated', {
        component: 'AIService',
        length: generatedText.length
      });

      return this.cleanTweetText(generatedText);
    } catch (error) {
      logger.error('Failed to generate tweet variation', {
        component: 'AIService',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate multiple variations
   */
  async generateMultipleVariations(sourceTweet, count = 3) {
    try {
      const variations = [];
      
      for (let i = 0; i < count; i++) {
        const variation = await this.generateTweetVariation(sourceTweet);
        variations.push(variation);
      }

      return variations;
    } catch (error) {
      logger.error('Failed to generate multiple variations', {
        component: 'AIService',
        error: error.message
      });
      return [];
    }
  }

  /**
   * Generate contextual reply to a tweet
   */
  async generateReply(targetTweet, context = {}) {
    try {
      logger.info('Generating reply', {
        component: 'AIService',
        action: 'generateReply',
        targetLength: targetTweet.length
      });

      const prompt = this.buildReplyPrompt(targetTweet, context);

      const response = await this.client.chat.completions.create({
        model: config.ai.model,
        temperature: config.ai.replyTemperature,
        max_tokens: 80,
        messages: [
          {
            role: 'system',
            content: 'You are a friendly software developer engaging in Twitter conversations. Write short, genuine replies that add value, show personality, or ask thoughtful questions. Be conversational and authentic. Avoid generic responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const replyText = response.choices[0].message.content.trim();
      
      logger.info('Reply generated', {
        component: 'AIService',
        length: replyText.length
      });

      return this.cleanTweetText(replyText);
    } catch (error) {
      logger.error('Failed to generate reply', {
        component: 'AIService',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build prompt for tweet generation
   */
  buildTweetPrompt(sourceTweet, context) {
    let prompt = `Create a unique variation of this tweet about software development. `;
    prompt += `Make it feel natural and genuine, like something a real developer would tweet. `;
    prompt += `Keep it under 280 characters. DO NOT use hashtags unless absolutely natural.\n\n`;
    prompt += `Original tweet: "${sourceTweet}"\n\n`;
    
    if (context.topic) {
      prompt += `Topic focus: ${context.topic}\n`;
    }
    
    prompt += `Write only the tweet text, nothing else.`;
    
    return prompt;
  }

  /**
   * Build prompt for reply generation
   */
  buildReplyPrompt(targetTweet, context) {
    let prompt = `Write a short, authentic reply to this tweet. `;
    prompt += `Be helpful, witty, or ask a good question. Keep it under 150 characters. `;
    prompt += `NO hashtags. Sound like a real person.\n\n`;
    prompt += `Tweet to reply to: "${targetTweet}"\n\n`;
    
    if (context.replyType) {
      const typeGuides = {
        supportive: 'Show agreement and support',
        curious: 'Ask an insightful question',
        humorous: 'Add a witty comment',
        technical: 'Add technical insight or clarification'
      };
      prompt += `Style: ${typeGuides[context.replyType] || 'Be genuine and engaging'}\n`;
    }
    
    prompt += `Write only the reply text, nothing else.`;
    
    return prompt;
  }

  /**
   * Clean generated text
   */
  cleanTweetText(text) {
    let cleaned = text
      .replace(/^["']|["']$/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (cleaned.length > 280) {
      cleaned = cleaned.substring(0, 277) + '...';
    }

    return cleaned;
  }

  /**
   * Analyze text sentiment (basic)
   */
  async analyzeSentiment(text) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.3,
        max_tokens: 20,
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment and respond with one word: positive, negative, neutral, humorous, or technical'
          },
          {
            role: 'user',
            content: text
          }
        ]
      });

      return response.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      logger.debug('Sentiment analysis failed', {
        component: 'AIService',
        error: error.message
      });
      return 'neutral';
    }
  }
}

export default AIService;
