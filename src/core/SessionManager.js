import fs from 'fs';
import path from 'path';
import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * Session Manager - Handles session persistence through cookies and storage
 */
class SessionManager {
  constructor() {
    this.sessionFile = config.paths.sessionFile;
    this.ensureConfigDirectory();
  }

  /**
   * Ensure config directory exists
   */
  ensureConfigDirectory() {
    const configDir = path.dirname(this.sessionFile);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  /**
   * Save session data (cookies and storage state)
   */
  async saveSession(context) {
    try {
      logger.info('Saving session data', { component: 'SessionManager', action: 'saveSession' });

      const cookies = await context.cookies();
      const localStorage = await context.storageState();

      const sessionData = {
        cookies,
        storageState: localStorage,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      fs.writeFileSync(
        this.sessionFile,
        JSON.stringify(sessionData, null, 2),
        'utf-8'
      );

      logger.info('Session saved successfully', { 
        component: 'SessionManager',
        cookieCount: cookies.length
      });

      return true;
    } catch (error) {
      logger.error('Failed to save session', {
        component: 'SessionManager',
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Load session data and restore to context
   */
  async loadSession(context) {
    try {
      if (!this.sessionExists()) {
        logger.info('No existing session found', { component: 'SessionManager' });
        return false;
      }

      logger.info('Loading session data', { component: 'SessionManager', action: 'loadSession' });

      const sessionData = JSON.parse(
        fs.readFileSync(this.sessionFile, 'utf-8')
      );

      if (!this.isSessionValid(sessionData)) {
        logger.warn('Session data is invalid or expired', { component: 'SessionManager' });
        return false;
      }

      await context.addCookies(sessionData.cookies);
      
      logger.info('Session loaded successfully', {
        component: 'SessionManager',
        cookieCount: sessionData.cookies.length,
        age: this.getSessionAge(sessionData.timestamp)
      });

      return true;
    } catch (error) {
      logger.error('Failed to load session', {
        component: 'SessionManager',
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if session file exists
   */
  sessionExists() {
    return fs.existsSync(this.sessionFile);
  }

  /**
   * Validate session data
   */
  isSessionValid(sessionData) {
    if (!sessionData || !sessionData.cookies || !sessionData.timestamp) {
      return false;
    }

    const sessionAge = this.getSessionAge(sessionData.timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (sessionAge > maxAge) {
      logger.info('Session expired', { 
        component: 'SessionManager',
        ageHours: Math.floor(sessionAge / (60 * 60 * 1000))
      });
      return false;
    }

    return true;
  }

  /**
   * Get session age in milliseconds
   */
  getSessionAge(timestamp) {
    return Date.now() - new Date(timestamp).getTime();
  }

  /**
   * Delete session file
   */
  clearSession() {
    try {
      if (this.sessionExists()) {
        fs.unlinkSync(this.sessionFile);
        logger.info('Session cleared', { component: 'SessionManager' });
      }
      return true;
    } catch (error) {
      logger.error('Failed to clear session', {
        component: 'SessionManager',
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get session metadata
   */
  getSessionMetadata() {
    try {
      if (!this.sessionExists()) {
        return null;
      }

      const sessionData = JSON.parse(
        fs.readFileSync(this.sessionFile, 'utf-8')
      );

      return {
        timestamp: sessionData.timestamp,
        age: this.getSessionAge(sessionData.timestamp),
        version: sessionData.version,
        cookieCount: sessionData.cookies.length,
        valid: this.isSessionValid(sessionData)
      };
    } catch (error) {
      logger.error('Failed to get session metadata', {
        component: 'SessionManager',
        error: error.message
      });
      return null;
    }
  }
}

export default SessionManager;
