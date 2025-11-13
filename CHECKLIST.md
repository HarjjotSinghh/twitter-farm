# Twitter Farm - Setup Checklist

Use this checklist to ensure proper setup and deployment.

## ☐ Prerequisites

- [ ] Node.js 18+ installed
  ```bash
  node --version  # Should show v18.x.x or higher
  ```

- [ ] npm available
  ```bash
  npm --version
  ```

- [ ] Twitter/X account created
  - [ ] Account is active and in good standing
  - [ ] Email verified
  - [ ] Phone verified (if required)

- [ ] OpenAI account created
  - [ ] API key generated
  - [ ] Billing setup complete
  - [ ] Credits available

## ☐ Installation

- [ ] Repository cloned/downloaded
  ```bash
  cd D:\Projects\twitter-farm
  ```

- [ ] Dependencies installed
  ```bash
  npm install
  ```
  - [ ] Should complete without errors
  - [ ] 179 packages installed

- [ ] Playwright browsers installed
  ```bash
  npx playwright install chromium
  ```
  - [ ] Chromium downloaded successfully

## ☐ Configuration

- [ ] `.env` file created
  ```bash
  copy .env.example .env
  ```

- [ ] Twitter credentials added to `.env`:
  ```env
  TWITTER_USERNAME=___________
  TWITTER_PASSWORD=___________
  TWITTER_EMAIL=___________
  ```

- [ ] OpenAI API key added to `.env`:
  ```env
  OPENAI_API_KEY=sk-___________
  ```

- [ ] Optional settings configured (if needed):
  - [ ] `HEADLESS_MODE` (false for debugging)
  - [ ] `LOG_LEVEL` (debug for verbose)
  - [ ] `MIN_POST_INTERVAL` (adjust timing)
  - [ ] `DAILY_POST_TARGET` (adjust volume)

## ☐ First Run Test

- [ ] Dry-run mode executed
  ```bash
  npm run dry-run
  ```

- [ ] Verify dry-run results:
  - [ ] ✅ "Browser initialized successfully"
  - [ ] ✅ "Authentication successful"
  - [ ] ✅ "Session saved successfully"
  - [ ] ✅ "Scraping trending tweets"
  - [ ] ✅ "Content generation completed"
  - [ ] ✅ "[DRY RUN] Would post tweet"

- [ ] Check created files:
  - [ ] `config/session.json` exists
  - [ ] `data/content_queue.json` has items
  - [ ] `logs/combined.log` contains activity

## ☐ Content Review

- [ ] Content-only mode executed
  ```bash
  npm run content-only
  ```

- [ ] Review generated content:
  ```bash
  type data\content_queue.json
  ```
  - [ ] Content is appropriate
  - [ ] Content is developer-focused
  - [ ] No crypto/political content
  - [ ] Quality is acceptable

## ☐ Production Readiness

- [ ] Settings verified in `.env`:
  - [ ] `MIN_POST_INTERVAL` appropriate (default: 90)
  - [ ] `MAX_POST_INTERVAL` appropriate (default: 240)
  - [ ] `DAILY_POST_TARGET` reasonable (default: 8)
  - [ ] `DAILY_REPLY_TARGET` reasonable (default: 20)

- [ ] Safety checks:
  - [ ] Starting with conservative settings
  - [ ] Monitoring plan in place
  - [ ] Ready to stop if needed (Ctrl+C)

## ☐ First Production Run

- [ ] Application started
  ```bash
  npm start
  ```

- [ ] Monitor initial activity (first 30 minutes):
  - [ ] ✅ Authentication successful
  - [ ] ✅ Content generated
  - [ ] ✅ First post successful
  - [ ] ✅ No errors in logs

- [ ] Verify on Twitter:
  - [ ] Tweet appears on profile
  - [ ] Content looks good
  - [ ] Media uploaded (if applicable)

## ☐ Ongoing Monitoring (First Day)

- [ ] Check every 2 hours:
  - [ ] Application still running
  - [ ] No critical errors in logs
  - [ ] Posts appearing on Twitter
  - [ ] Replies being made

- [ ] Review logs:
  ```bash
  type logs\combined.log
  ```
  - [ ] No repeated errors
  - [ ] Timing looks natural
  - [ ] Actions completing successfully

- [ ] Check data files:
  ```bash
  type data\posted_tweets.json
  type data\replies.json
  ```
  - [ ] Counts match Twitter activity
  - [ ] Within daily targets

## ☐ First Week Optimization

- [ ] Review performance metrics:
  - [ ] Posts per day: _____ (target: 8)
  - [ ] Replies per day: _____ (target: 20)
  - [ ] Error rate: _____ (should be low)

- [ ] Adjust if needed:
  - [ ] Increase/decrease posting intervals
  - [ ] Adjust engagement targets
  - [ ] Modify content keywords
  - [ ] Change AI temperature

## ☐ Long-Term Maintenance

- [ ] Weekly tasks:
  - [ ] Review logs for errors
  - [ ] Check content quality
  - [ ] Verify Twitter account health
  - [ ] Monitor API usage/costs

- [ ] Monthly tasks:
  - [ ] Update dependencies if needed
  - [ ] Review and optimize settings
  - [ ] Clean up old logs manually if large
  - [ ] Check for Twitter UI changes

## ☐ Troubleshooting Checklist

If issues occur:

- [ ] Check logs first:
  ```bash
  type logs\error.log
  ```

- [ ] Common fixes:
  - [ ] Delete session: `del config\session.json`
  - [ ] Clear cache: `del /Q cache\media\*`
  - [ ] Reinstall browsers: `npx playwright install`
  - [ ] Update dependencies: `npm update`

- [ ] Test in dry-run after fixes:
  ```bash
  npm run dry-run
  ```

## ☐ Safety & Compliance

- [ ] Understand risks:
  - [ ] Bot activity may violate ToS
  - [ ] Account could be suspended
  - [ ] Use at own risk

- [ ] Ethical usage:
  - [ ] Not spamming
  - [ ] Providing value in engagement
  - [ ] Respecting content creators
  - [ ] Following community guidelines

- [ ] Security:
  - [ ] `.env` not committed to Git
  - [ ] API keys kept secret
  - [ ] Session file protected
  - [ ] Regular security reviews

## ✅ Completion

Once all items are checked:

- [ ] **System is properly configured**
- [ ] **Tested successfully in dry-run**
- [ ] **Content quality is good**
- [ ] **Monitoring is in place**
- [ ] **Ready for production use**

---

## Quick Commands Reference

```bash
# Install
npm install
npx playwright install chromium

# Configure
copy .env.example .env
# Edit .env with your credentials

# Test
npm run dry-run

# Run
npm start

# Stop
Ctrl+C

# Monitor
type logs\combined.log
type data\content_queue.json
type data\posted_tweets.json
```

## Support Resources

- 📖 **Main Documentation**: `README.md`
- 🚀 **Quick Start**: `QUICKSTART.md`
- 💡 **Examples**: `EXAMPLES.md`
- 🏗️ **Architecture**: `ARCHITECTURE.md`
- 📊 **Project Summary**: `PROJECT_SUMMARY.md`

---

**Status**: Ready to start when all boxes are checked! ✅
