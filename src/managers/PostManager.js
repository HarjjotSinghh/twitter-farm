import config from '../config/config.js';
import logger from '../utils/logger.js';
import DataStore from '../data/DataStore.js';
import { sleep } from '../utils/helpers.js';

class PostManager {
  constructor(browserController) {
    this.browser = browserController;
    this.dataStore = new DataStore();
  }

  async postTweet(content, dryRun = false) {
    try {
      logger.info('Posting tweet', {
        component: 'PostManager',
        action: 'postTweet',
        contentId: content.content_id,
        hasMedia: content.media_local_paths.length > 0,
        dryRun
      });

      if (dryRun) {
        logger.info('[DRY RUN] Would post tweet', {
          component: 'PostManager',
          text: content.text
        });
        return { success: true, postId: 'dry-run-' + Date.now() };
      }

      await this.browser.goto('https://twitter.com/compose/tweet');
      await sleep(2000);

      const composeButton = await this.browser.page.$('[data-testid="SideNav_NewTweet_Button"]');
      if (composeButton) {
        await composeButton.click();
        await sleep(1500);
      }

      await this.browser.typeText(
        config.selectors.tweetTextarea,
        content.text
      );

      if (content.media_local_paths && content.media_local_paths.length > 0) {
        await this.uploadMedia(content.media_local_paths[0]);
      }

      await sleep(1000);

      const tweetButton = await this.browser.page.$(config.selectors.tweetButton);
      if (tweetButton) {
        await tweetButton.click();
        await sleep(3000);

        this.dataStore.updateContentStatus(content.content_id, 'posted');
        this.dataStore.addPostedTweet({
          postId: content.content_id,
          contentId: content.content_id
        });

        logger.info('Tweet posted successfully', {
          component: 'PostManager',
          contentId: content.content_id
        });

        return { success: true, postId: content.content_id };
      }

      throw new Error('Post button not found');
    } catch (error) {
      logger.error('Failed to post tweet', {
        component: 'PostManager',
        error: error.message
      });

      this.dataStore.updateContentStatus(content.content_id, 'failed');
      return { success: false, error: error.message };
    }
  }

  async uploadMedia(filepath) {
    try {
      const fileInput = await this.browser.page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(filepath);
        await sleep(3000);

        logger.debug('Media uploaded', {
          component: 'PostManager',
          filepath
        });
      }
    } catch (error) {
      logger.error('Media upload failed', {
        component: 'PostManager',
        error: error.message
      });
    }
  }

  async verifyPost() {
    try {
      await this.browser.goto('https://twitter.com/home');
      await sleep(2000);
      return true;
    } catch (error) {
      logger.error('Post verification failed', {
        component: 'PostManager',
        error: error.message
      });
      return false;
    }
  }
}

export default PostManager;
