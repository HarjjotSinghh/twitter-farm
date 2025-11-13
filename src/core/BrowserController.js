import { chromium, firefox, webkit } from 'playwright';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { sleep, randomInt } from '../utils/helpers.js';

/**
 * Browser Controller - Manages Playwright browser instance and page interactions
 */
class BrowserController {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isInitialized = false;
  }

  /**
   * Initialize browser instance
   */
  async initialize() {
    try {
      logger.info('Initializing browser', { component: 'BrowserController', action: 'initialize' });

      const browserType = this.getBrowserType();
      
      this.browser = await browserType.launch({
        headless: config.browser.headless,
        slowMo: config.browser.slowMo,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'en-US',
        timezoneId: 'America/New_York'
      });

      await this.context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined
        });
      });

      this.page = await this.context.newPage();
      
      await this.page.setDefaultTimeout(config.system.navigationTimeout);
      await this.page.setDefaultNavigationTimeout(config.system.navigationTimeout);

      this.isInitialized = true;
      logger.info('Browser initialized successfully', { component: 'BrowserController' });

      return true;
    } catch (error) {
      logger.error('Failed to initialize browser', { 
        component: 'BrowserController',
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get browser type based on configuration
   */
  getBrowserType() {
    switch (config.browser.type) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }

  /**
   * Navigate to URL with retry logic
   */
  async goto(url, options = {}) {
    this.ensureInitialized();
    
    try {
      logger.debug(`Navigating to ${url}`, { component: 'BrowserController', action: 'goto' });
      await this.page.goto(url, { waitUntil: 'domcontentloaded', ...options });
      await this.humanDelay();
      return true;
    } catch (error) {
      logger.error(`Navigation failed: ${url}`, { 
        component: 'BrowserController',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Type text with human-like behavior
   */
  async typeText(selector, text, options = {}) {
    this.ensureInitialized();
    
    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.humanDelay();
      
      const element = await this.page.$(selector);
      await element.click();
      await sleep(randomInt(100, 300));

      const typingDelay = this.calculateTypingDelay(text);
      
      for (const char of text) {
        await this.page.keyboard.type(char);
        await sleep(randomInt(50, typingDelay));
      }

      logger.debug(`Typed text into ${selector}`, { 
        component: 'BrowserController',
        action: 'typeText',
        length: text.length
      });

      return true;
    } catch (error) {
      logger.error(`Failed to type text into ${selector}`, {
        component: 'BrowserController',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Click element with human-like delay
   */
  async click(selector, options = {}) {
    this.ensureInitialized();
    
    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.humanDelay();
      
      await this.page.click(selector, options);
      
      logger.debug(`Clicked ${selector}`, { component: 'BrowserController', action: 'click' });
      
      await this.humanDelay();
      return true;
    } catch (error) {
      logger.error(`Failed to click ${selector}`, {
        component: 'BrowserController',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Wait for selector with timeout
   */
  async waitForSelector(selector, options = {}) {
    this.ensureInitialized();
    
    try {
      await this.page.waitForSelector(selector, { timeout: 10000, ...options });
      return true;
    } catch (error) {
      logger.debug(`Selector not found: ${selector}`, { component: 'BrowserController' });
      return false;
    }
  }

  /**
   * Get text content from selector
   */
  async getTextContent(selector) {
    this.ensureInitialized();
    
    try {
      const element = await this.page.$(selector);
      if (!element) return null;
      
      const text = await element.textContent();
      return text ? text.trim() : null;
    } catch (error) {
      logger.debug(`Failed to get text from ${selector}`, { 
        component: 'BrowserController',
        error: error.message
      });
      return null;
    }
  }

  /**
   * Get multiple elements matching selector
   */
  async getElements(selector) {
    this.ensureInitialized();
    
    try {
      const elements = await this.page.$$(selector);
      return elements;
    } catch (error) {
      logger.debug(`Failed to get elements ${selector}`, {
        component: 'BrowserController',
        error: error.message
      });
      return [];
    }
  }

  /**
   * Scroll page smoothly
   */
  async scroll(distance = 300) {
    this.ensureInitialized();
    
    try {
      await this.page.evaluate((dist) => {
        window.scrollBy({
          top: dist,
          behavior: 'smooth'
        });
      }, distance);
      
      await sleep(randomInt(500, 1500));
      
      logger.debug(`Scrolled ${distance}px`, { component: 'BrowserController', action: 'scroll' });
    } catch (error) {
      logger.debug('Scroll failed', { component: 'BrowserController', error: error.message });
    }
  }

  /**
   * Take screenshot
   */
  async screenshot(path) {
    this.ensureInitialized();
    
    try {
      await this.page.screenshot({ path, fullPage: false });
      logger.debug(`Screenshot saved: ${path}`, { component: 'BrowserController' });
      return true;
    } catch (error) {
      logger.error('Screenshot failed', { component: 'BrowserController', error: error.message });
      return false;
    }
  }

  /**
   * Get current URL
   */
  async getCurrentUrl() {
    this.ensureInitialized();
    return this.page.url();
  }

  /**
   * Execute JavaScript in page context
   */
  async evaluate(fn, ...args) {
    this.ensureInitialized();
    return await this.page.evaluate(fn, ...args);
  }

  /**
   * Human-like random delay
   */
  async humanDelay() {
    const delay = randomInt(
      config.behavior.clickDelayMin,
      config.behavior.clickDelayMax
    );
    await sleep(delay);
  }

  /**
   * Calculate typing delay based on WPM
   */
  calculateTypingDelay(text) {
    const wpm = config.behavior.typingSpeedWPM;
    const variance = config.behavior.typingVariance;
    const actualWpm = randomInt(wpm - variance, wpm + variance);
    const charsPerMinute = actualWpm * 5;
    const msPerChar = 60000 / charsPerMinute;
    return Math.floor(msPerChar);
  }

  /**
   * Ensure browser is initialized
   */
  ensureInitialized() {
    if (!this.isInitialized || !this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }
  }

  /**
   * Close browser
   */
  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        logger.info('Browser closed', { component: 'BrowserController' });
      }
      this.browser = null;
      this.context = null;
      this.page = null;
      this.isInitialized = false;
    } catch (error) {
      logger.error('Error closing browser', { 
        component: 'BrowserController',
        error: error.message
      });
    }
  }
}

export default BrowserController;
