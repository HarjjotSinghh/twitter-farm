import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from '../config/config.js';

class Logger {
  constructor() {
    this.ensureLogDirectory();
    this.logger = this.createLogger();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(config.paths.logs)) {
      fs.mkdirSync(config.paths.logs, { recursive: true });
    }
  }

  createLogger() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, component, action, ...meta }) => {
        let log = `${timestamp} ${level}`;
        if (component) log += ` [${component}]`;
        if (action) log += ` {${action}}`;
        log += `: ${message}`;
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        return log;
      })
    );

    return winston.createLogger({
      level: config.app.logLevel,
      format: logFormat,
      transports: [
        new winston.transports.File({
          filename: path.join(config.paths.logs, 'error.log'),
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: path.join(config.paths.logs, 'combined.log'),
          maxsize: 5242880,
          maxFiles: 10
        }),
        new winston.transports.Console({
          format: consoleFormat
        })
      ]
    });
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  critical(message, meta = {}) {
    this.logger.error(message, { ...meta, severity: 'CRITICAL' });
  }
}

export default new Logger();
