import config from '../config/config.js';
import logger from '../utils/logger.js';
import BrowserController from '../core/BrowserController.js';
import AuthenticationManager from '../core/AuthenticationManager.js';
import TwitterScraper from '../services/TwitterScraper.js';
import PostManager from '../managers/PostManager.js';
import EngagementEngine from '../managers/EngagementEngine.js';
import DataStore from '../data/DataStore.js';
import MediaHandler from '../services/MediaHandler.js';
import { sleep, randomInt, isWeekend } from '../utils/helpers.js';

class Orchestrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.contentOnly = options.contentOnly || false;
    this.isRunning = false;
    
    this.browser = null;
    this.auth = null;
    this.scraper = null;
    this.postManager = null;
    this.engagementEngine = null;
    this.dataStore = new DataStore();
    this.mediaHandler = new MediaHandler();
  }

  async initialize() {
    try {
      logger.info('Initializing Orchestrator', {
        component: 'Orchestrator',
        dryRun: this.dryRun,
        contentOnly: this.contentOnly
      });

      config.validate();

      this.browser = new BrowserController();
      await this.browser.initialize();

      this.auth = new AuthenticationManager(this.browser);
      const authenticated = await this.auth.authenticate();

      if (!authenticated) {
        throw new Error('Authentication failed');
      }

      this.scraper = new TwitterScraper(this.browser);
      this.postManager = new PostManager(this.browser);
      this.engagementEngine = new EngagementEngine(this.browser);

      logger.info('Orchestrator initialized successfully', {
        component: 'Orchestrator'
      });

      return true;
    } catch (error) {
      logger.error('Orchestrator initialization failed', {
        component: 'Orchestrator',
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async start() {
    try {
      this.isRunning = true;
      logger.info('Starting orchestrator', { component: 'Orchestrator' });

      if (this.contentOnly) {
        await this.runContentOnlyMode();
        return;
      }

      await this.mainLoop();
    } catch (error) {
      logger.error('Orchestrator encountered error', {
        component: 'Orchestrator',
        error: error.message
      });
      this.isRunning = false;
    }
  }

  async mainLoop() {
    while (this.isRunning) {
      try {
        await this.checkAndGenerateContent();
        
        const action = this.decideNextAction();
        
        logger.info(`Next action: ${action}`, { component: 'Orchestrator' });

        switch (action) {
          case 'post':
            await this.executePostAction();
            break;
          case 'engage':
            await this.executeEngagementAction();
            break;
          case 'idle':
            await this.executeIdleAction();
            break;
        }

        await this.cleanupOldData();

      } catch (error) {
        logger.error('Main loop error', {
          component: 'Orchestrator',
          error: error.message
        });
        await sleep(60000);
      }
    }
  }

  async runContentOnlyMode() {
    logger.info('Running in content-only mode', { component: 'Orchestrator' });
    
    const content = await this.scraper.generateContentFromTrends();
    
    logger.info(`Generated ${content.length} content items`, {
      component: 'Orchestrator',
      count: content.length
    });

    await this.shutdown();
  }

  async checkAndGenerateContent() {
    const queue = this.dataStore.getContentQueue();
    const queuedCount = queue.filter(item => item.status === 'queued').length;

    if (queuedCount < config.content.queueSize / 2) {
      logger.info('Content queue low, generating new content', {
        component: 'Orchestrator',
        currentCount: queuedCount
      });

      await this.scraper.generateContentFromTrends();
    }
  }

  decideNextAction() {
    const postedToday = this.dataStore.getPostedTweetsToday().length;
    const repliedToday = this.dataStore.getRepliesToday().length;

    if (postedToday >= config.posting.dailyTarget && 
        repliedToday >= config.engagement.dailyReplyTarget) {
      return 'idle';
    }

    if (postedToday < config.posting.dailyTarget) {
      const shouldPost = Math.random() > 0.5;
      if (shouldPost) return 'post';
    }

    if (repliedToday < config.engagement.dailyReplyTarget) {
      return 'engage';
    }

    return 'idle';
  }

  async executePostAction() {
    try {
      const nextContent = this.dataStore.getNextContentItem();

      if (!nextContent) {
        logger.warn('No content available to post', { component: 'Orchestrator' });
        return;
      }

      logger.info('Executing post action', {
        component: 'Orchestrator',
        contentId: nextContent.content_id
      });

      const result = await this.postManager.postTweet(nextContent, this.dryRun);

      if (result.success) {
        const delay = this.calculatePostDelay();
        logger.info(`Post successful, waiting ${Math.floor(delay / 60000)} minutes`, {
          component: 'Orchestrator'
        });
        await sleep(delay);
      }
    } catch (error) {
      logger.error('Post action failed', {
        component: 'Orchestrator',
        error: error.message
      });
    }
  }

  async executeEngagementAction() {
    try {
      logger.info('Executing engagement action', { component: 'Orchestrator' });

      const replyCount = randomInt(1, 3);
      await this.engagementEngine.engageBatch(replyCount, this.dryRun);

      const delay = randomInt(
        config.engagement.minReplyInterval * 60 * 1000,
        config.engagement.maxReplyInterval * 60 * 1000
      );

      logger.info(`Engagement complete, waiting ${Math.floor(delay / 60000)} minutes`, {
        component: 'Orchestrator'
      });

      await sleep(delay);
    } catch (error) {
      logger.error('Engagement action failed', {
        component: 'Orchestrator',
        error: error.message
      });
    }
  }

  async executeIdleAction() {
    const idleDuration = randomInt(
      config.behavior.breakDurationMin * 60 * 1000,
      config.behavior.breakDurationMax * 60 * 1000
    );

    logger.info(`Idle period, waiting ${Math.floor(idleDuration / 60000)} minutes`, {
      component: 'Orchestrator'
    });

    await sleep(idleDuration);
  }

  calculatePostDelay() {
    let baseMin = config.posting.minInterval * 60 * 1000;
    let baseMax = config.posting.maxInterval * 60 * 1000;

    if (isWeekend()) {
      baseMin *= config.posting.weekendMultiplier;
      baseMax *= config.posting.weekendMultiplier;
    }

    return randomInt(baseMin, baseMax);
  }

  async cleanupOldData() {
    try {
      this.mediaHandler.cleanupOldMedia(24);
      this.dataStore.cleanupOldData(30);
    } catch (error) {
      logger.debug('Cleanup error', {
        component: 'Orchestrator',
        error: error.message
      });
    }
  }

  async shutdown() {
    try {
      logger.info('Shutting down orchestrator', { component: 'Orchestrator' });
      
      this.isRunning = false;

      if (this.browser) {
        await this.browser.close();
      }

      logger.info('Shutdown complete', { component: 'Orchestrator' });
    } catch (error) {
      logger.error('Shutdown error', {
        component: 'Orchestrator',
        error: error.message
      });
    }
  }
}

export default Orchestrator;
