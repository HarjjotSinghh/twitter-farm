import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

/**
 * Application configuration management
 * Loads settings from environment variables with fallback defaults
 */
class Config {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.loadConfig();
  }

  loadConfig() {
    // Twitter/X Credentials
    this.twitter = {
      username: process.env.TWITTER_USERNAME || '',
      password: process.env.TWITTER_PASSWORD || '',
      email: process.env.TWITTER_EMAIL || ''
    };

    // OpenAI Configuration
    this.ai = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      replyTemperature: parseFloat(process.env.REPLY_AI_TEMPERATURE || '0.8')
    };

    // Application Settings
    this.app = {
      env: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      headlessMode: process.env.HEADLESS_MODE === 'true'
    };

    // Browser Settings
    this.browser = {
      type: 'chromium',
      headless: this.app.headlessMode,
      userDataDir: path.join(this.rootDir, 'browser-data'),
      slowMo: this.app.env === 'development' ? 50 : 0
    };

    // Paths
    this.paths = {
      root: this.rootDir,
      config: path.join(this.rootDir, 'config'),
      cache: path.join(this.rootDir, 'cache'),
      media: path.join(this.rootDir, 'cache', 'media'),
      logs: path.join(this.rootDir, 'logs'),
      data: path.join(this.rootDir, 'data'),
      sessionFile: path.join(this.rootDir, 'config', 'session.json')
    };

    // Posting Schedule
    this.posting = {
      minInterval: parseInt(process.env.MIN_POST_INTERVAL || '90', 10), // minutes
      maxInterval: parseInt(process.env.MAX_POST_INTERVAL || '240', 10),
      dailyTarget: parseInt(process.env.DAILY_POST_TARGET || '8', 10),
      peakHours: [[9, 11], [14, 16], [20, 22]], // Hour ranges
      weekendMultiplier: 0.7
    };

    // Engagement Settings
    this.engagement = {
      dailyReplyTarget: parseInt(process.env.DAILY_REPLY_TARGET || '20', 10),
      minReplyInterval: parseInt(process.env.MIN_REPLY_INTERVAL || '5', 10), // minutes
      maxReplyInterval: parseInt(process.env.MAX_REPLY_INTERVAL || '30', 10),
      minTargetFollowers: parseInt(process.env.MIN_TARGET_FOLLOWERS || '500', 10),
      minTargetLikes: 100,
      minTargetRetweets: 20
    };

    // Content Settings
    this.content = {
      queueSize: parseInt(process.env.CONTENT_QUEUE_SIZE || '20', 10),
      generationBatch: parseInt(process.env.CONTENT_GENERATION_BATCH || '5', 10),
      mediaMaxSizeMB: parseInt(process.env.MEDIA_MAX_SIZE_MB || '5', 10),
      minEngagementThreshold: parseInt(process.env.MIN_ENGAGEMENT_THRESHOLD || '100', 10),
      trendFetchInterval: parseInt(process.env.TREND_FETCH_INTERVAL || '60', 10), // minutes
      // Developer-focused keywords for filtering
      developerKeywords: [
        'javascript', 'typescript', 'python', 'java', 'react', 'node',
        'developer', 'programming', 'coding', 'software', 'engineer',
        'frontend', 'backend', 'fullstack', 'devops', 'api', 'database',
        'git', 'github', 'vscode', 'code', 'tech', 'startup', 'swe', 'sde'
      ],
      // Topics to exclude
      excludedTopics: [
        'crypto', 'bitcoin', 'nft', 'web3', 'blockchain',
        'political', 'election', 'vote'
      ]
    };

    // Behavior Simulation
    this.behavior = {
      typingSpeedWPM: parseInt(process.env.TYPING_SPEED_WPM || '60', 10),
      typingVariance: parseInt(process.env.TYPING_VARIANCE || '20', 10),
      mouseMovementEnabled: true,
      scrollBehavior: 'smooth',
      sessionDurationMin: parseInt(process.env.SESSION_DURATION_MIN || '15', 10), // minutes
      sessionDurationMax: parseInt(process.env.SESSION_DURATION_MAX || '45', 10),
      breakDurationMin: parseInt(process.env.BREAK_DURATION_MIN || '30', 10),
      breakDurationMax: parseInt(process.env.BREAK_DURATION_MAX || '90', 10),
      clickDelayMin: 200, // ms
      clickDelayMax: 800
    };

    // System Settings
    this.system = {
      maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
      requestTimeout: 30000, // ms
      navigationTimeout: 60000
    };

    // Twitter/X Selectors (may need updates as UI changes)
    this.selectors = {
      // Authentication
      usernameInput: 'input[autocomplete="username"]',
      passwordInput: 'input[name="password"]',
      loginButton: '[data-testid="LoginForm_Login_Button"]',
      
      // Compose
      composeTweetButton: '[data-testid="SideNav_NewTweet_Button"]',
      tweetTextarea: '[data-testid="tweetTextarea_0"]',
      tweetButton: '[data-testid="tweetButtonInline"]',
      mediaUploadButton: '[data-testid="fileInput"]',
      
      // Timeline
      timeline: '[data-testid="primaryColumn"]',
      tweet: '[data-testid="tweet"]',
      replyButton: '[data-testid="reply"]',
      
      // Profile
      profileLink: '[data-testid="AppTabBar_Profile_Link"]',
      
      // Common
      spinner: '[role="progressbar"]'
    };
  }

  /**
   * Validate critical configuration
   */
  validate() {
    const errors = [];

    if (!this.twitter.username) {
      errors.push('TWITTER_USERNAME is required');
    }
    if (!this.twitter.password) {
      errors.push('TWITTER_PASSWORD is required');
    }
    if (!this.ai.apiKey) {
      errors.push('OPENAI_API_KEY is required');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }

  /**
   * Get configuration as object
   */
  toObject() {
    return {
      twitter: { ...this.twitter, password: '***REDACTED***' },
      ai: { ...this.ai, apiKey: '***REDACTED***' },
      app: this.app,
      browser: this.browser,
      paths: this.paths,
      posting: this.posting,
      engagement: this.engagement,
      content: this.content,
      behavior: this.behavior,
      system: this.system
    };
  }
}

// Export singleton instance
export default new Config();
