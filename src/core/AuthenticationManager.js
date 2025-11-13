import config from '../config/config.js';
import logger from '../utils/logger.js';
import SessionManager from './SessionManager.js';
import { sleep, retryWithBackoff } from '../utils/helpers.js';

/**
 * Authentication Manager - Handles Twitter/X login and session validation
 */
class AuthenticationManager {
  constructor(browserController) {
    this.browser = browserController;
    this.sessionManager = new SessionManager();
    this.isAuthenticated = false;
  }

  /**
   * Main authentication flow: restore session or perform login
   */
  async authenticate() {
    try {
      logger.info('Starting authentication', { 
        component: 'AuthenticationManager',
        action: 'authenticate'
      });

      const sessionRestored = await this.restoreSession();
      
      if (sessionRestored && await this.validateSession()) {
        this.isAuthenticated = true;
        logger.info('Authentication successful via session restoration', {
          component: 'AuthenticationManager'
        });
        return true;
      }

      logger.info('Session restoration failed, performing fresh login', {
        component: 'AuthenticationManager'
      });

      const loginSuccess = await this.performLogin();
      
      if (loginSuccess && await this.validateSession()) {
        await this.sessionManager.saveSession(this.browser.context);
        this.isAuthenticated = true;
        logger.info('Authentication successful via login', {
          component: 'AuthenticationManager'
        });
        return true;
      }

      logger.error('Authentication failed', { component: 'AuthenticationManager' });
      return false;

    } catch (error) {
      logger.error('Authentication error', {
        component: 'AuthenticationManager',
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Restore session from saved cookies
   */
  async restoreSession() {
    try {
      logger.info('Attempting to restore session', { 
        component: 'AuthenticationManager',
        action: 'restoreSession'
      });

      const restored = await this.sessionManager.loadSession(this.browser.context);
      
      if (!restored) {
        return false;
      }

      await this.browser.goto('https://twitter.com/home');
      await sleep(3000);

      return true;
    } catch (error) {
      logger.error('Session restoration failed', {
        component: 'AuthenticationManager',
        error: error.message
      });
      return false;
    }
  }

  /**
   * Perform fresh login
   */
  async performLogin() {
    try {
      logger.info('Performing login', { 
        component: 'AuthenticationManager',
        action: 'performLogin'
      });

      await this.browser.goto('https://twitter.com/i/flow/login');
      await sleep(2000);

      const success = await retryWithBackoff(async () => {
        await this.enterUsername();
        await this.handleUnusualActivity();
        await this.enterPassword();
        return true;
      }, 2, 3000);

      if (success) {
        await sleep(5000);
        logger.info('Login completed', { component: 'AuthenticationManager' });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Login failed', {
        component: 'AuthenticationManager',
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Enter username/email
   */
  async enterUsername() {
    try {
      logger.debug('Entering username', { component: 'AuthenticationManager' });

      const usernameSelector = config.selectors.usernameInput;
      await this.browser.waitForSelector(usernameSelector);
      await sleep(1000);

      await this.browser.typeText(usernameSelector, config.twitter.username);
      await sleep(500);

      const nextButtons = await this.browser.getElements('button');
      for (const button of nextButtons) {
        const text = await button.textContent();
        if (text && text.trim() === 'Next') {
          await button.click();
          await sleep(2000);
          break;
        }
      }

      return true;
    } catch (error) {
      logger.error('Failed to enter username', {
        component: 'AuthenticationManager',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle "unusual activity" prompt if it appears
   */
  async handleUnusualActivity() {
    try {
      const emailInputExists = await this.browser.waitForSelector(
        'input[data-testid="ocfEnterTextTextInput"]',
        { timeout: 5000 }
      );

      if (emailInputExists && config.twitter.email) {
        logger.info('Handling unusual activity verification', {
          component: 'AuthenticationManager'
        });

        await this.browser.typeText(
          'input[data-testid="ocfEnterTextTextInput"]',
          config.twitter.email
        );
        await sleep(500);

        const nextButtons = await this.browser.getElements('button');
        for (const button of nextButtons) {
          const text = await button.textContent();
          if (text && text.trim() === 'Next') {
            await button.click();
            await sleep(2000);
            break;
          }
        }
      }

      return true;
    } catch (error) {
      logger.debug('No unusual activity prompt', { component: 'AuthenticationManager' });
      return true;
    }
  }

  /**
   * Enter password
   */
  async enterPassword() {
    try {
      logger.debug('Entering password', { component: 'AuthenticationManager' });

      const passwordSelector = config.selectors.passwordInput;
      await this.browser.waitForSelector(passwordSelector);
      await sleep(1000);

      await this.browser.typeText(passwordSelector, config.twitter.password);
      await sleep(500);

      const loginButtons = await this.browser.getElements('button');
      for (const button of loginButtons) {
        const text = await button.textContent();
        if (text && (text.includes('Log in') || text.includes('Sign in'))) {
          await button.click();
          await sleep(3000);
          break;
        }
      }

      return true;
    } catch (error) {
      logger.error('Failed to enter password', {
        component: 'AuthenticationManager',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate that we're logged in
   */
  async validateSession() {
    try {
      logger.debug('Validating session', { 
        component: 'AuthenticationManager',
        action: 'validateSession'
      });

      const currentUrl = await this.browser.getCurrentUrl();
      
      if (currentUrl.includes('/home') || currentUrl.includes('/timeline')) {
        logger.info('Session validated successfully', { component: 'AuthenticationManager' });
        return true;
      }

      await this.browser.goto('https://twitter.com/home');
      await sleep(3000);

      const newUrl = await this.browser.getCurrentUrl();
      const isValid = newUrl.includes('/home') || newUrl.includes('/timeline');

      if (!isValid) {
        logger.warn('Session validation failed', {
          component: 'AuthenticationManager',
          url: newUrl
        });
      }

      return isValid;
    } catch (error) {
      logger.error('Session validation error', {
        component: 'AuthenticationManager',
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check authentication status
   */
  async checkAuthStatus() {
    return this.isAuthenticated && await this.validateSession();
  }

  /**
   * Logout and clear session
   */
  async logout() {
    try {
      this.sessionManager.clearSession();
      this.isAuthenticated = false;
      logger.info('Logged out successfully', { component: 'AuthenticationManager' });
      return true;
    } catch (error) {
      logger.error('Logout failed', {
        component: 'AuthenticationManager',
        error: error.message
      });
      return false;
    }
  }
}

export default AuthenticationManager;
