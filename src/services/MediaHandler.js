import axios from 'axios';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { sanitizeFilename } from '../utils/helpers.js';

class MediaHandler {
  constructor() {
    this.ensureMediaDirectory();
    this.maxSizeBytes = config.content.mediaMaxSizeMB * 1024 * 1024;
  }

  ensureMediaDirectory() {
    if (!fs.existsSync(config.paths.media)) {
      fs.mkdirSync(config.paths.media, { recursive: true });
    }
  }

  async downloadMedia(url, metadata = {}) {
    try {
      logger.info('Downloading media', {
        component: 'MediaHandler',
        action: 'downloadMedia',
        url
      });

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: this.maxSizeBytes
      });

      const contentType = response.headers['content-type'];
      const extension = this.getExtensionFromContentType(contentType);
      const filename = `${uuidv4()}${extension}`;
      const filepath = path.join(config.paths.media, filename);

      if (response.data.length > this.maxSizeBytes) {
        logger.warn('Media file too large, skipping', {
          component: 'MediaHandler',
          size: response.data.length
        });
        return null;
      }

      fs.writeFileSync(filepath, response.data);

      const mediaInfo = {
        filepath,
        filename,
        size: response.data.length,
        contentType,
        sourceUrl: url,
        downloadedAt: new Date().toISOString(),
        ...metadata
      };

      logger.info('Media downloaded successfully', {
        component: 'MediaHandler',
        filename,
        size: response.data.length
      });

      return mediaInfo;
    } catch (error) {
      logger.error('Failed to download media', {
        component: 'MediaHandler',
        url,
        error: error.message
      });
      return null;
    }
  }

  async downloadMultipleMedia(urls) {
    const downloads = [];
    
    for (const url of urls) {
      const result = await this.downloadMedia(url);
      if (result) {
        downloads.push(result);
      }
    }

    return downloads;
  }

  async optimizeImage(filepath) {
    try {
      const metadata = await sharp(filepath).metadata();
      
      if (metadata.width > 1200 || metadata.height > 1200) {
        await sharp(filepath)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .toFile(filepath + '.optimized');

        fs.renameSync(filepath + '.optimized', filepath);
        
        logger.debug('Image optimized', {
          component: 'MediaHandler',
          filepath
        });
      }

      return true;
    } catch (error) {
      logger.error('Image optimization failed', {
        component: 'MediaHandler',
        filepath,
        error: error.message
      });
      return false;
    }
  }

  getExtensionFromContentType(contentType) {
    const typeMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4'
    };

    return typeMap[contentType] || '.jpg';
  }

  deleteMedia(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        logger.debug('Media deleted', {
          component: 'MediaHandler',
          filepath
        });
      }
      return true;
    } catch (error) {
      logger.error('Failed to delete media', {
        component: 'MediaHandler',
        filepath,
        error: error.message
      });
      return false;
    }
  }

  cleanupOldMedia(maxAgeHours = 24) {
    try {
      const files = fs.readdirSync(config.paths.media);
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(config.paths.media, file);
        const stats = fs.statSync(filepath);
        const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);

        if (ageHours > maxAgeHours) {
          this.deleteMedia(filepath);
          deletedCount++;
        }
      }

      logger.info('Media cleanup completed', {
        component: 'MediaHandler',
        deletedCount
      });

      return deletedCount;
    } catch (error) {
      logger.error('Media cleanup failed', {
        component: 'MediaHandler',
        error: error.message
      });
      return 0;
    }
  }
}

export default MediaHandler;
