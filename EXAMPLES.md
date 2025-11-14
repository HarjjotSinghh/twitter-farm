# Twitter Farm - Usage Examples

## Example 1: First Time Setup and Dry Run

```bash
# Install dependencies
npm install
npx playwright install chromium

# Configure environment
copy .env.example .env
# Edit .env with your credentials

# Test with dry run
npm run dry-run
```

**Expected Output:**
```
==============================================
🐦 Twitter Farm - Browser Automation
==============================================
Mode: production
Dry Run: YES
Content Only: NO
==============================================

[INFO] Initializing Orchestrator
[INFO] Initializing browser
[INFO] Browser initialized successfully
[INFO] Starting authentication
[INFO] Attempting to restore session
[INFO] No existing session found
[INFO] Performing login
[INFO] Login completed
[INFO] Session validated successfully
[INFO] Authentication successful via login
[INFO] Orchestrator initialized successfully
[INFO] Starting orchestrator
[INFO] Content queue low, generating new content
[INFO] Scraping trending tweets...
[INFO] Scraped tweets (total: 15, filtered: 5)
[INFO] Generating tweet variation
[INFO] Tweet variation generated
[INFO] Content added to queue
[INFO] Content generation completed (count: 5)
[INFO] Next action: post
[INFO] [DRY RUN] Would post tweet
[INFO] Post successful, waiting 127 minutes
```

## Example 2: Content Generation Only

```bash
npm run content-only
```

**What This Does:**
1. Authenticates with Twitter
2. Scrapes trending developer tweets
3. Generates AI variations
4. Saves to content queue
5. Exits (doesn't post)

**Use Case:** Build up content queue before starting automation

## Example 3: Production Mode with Monitoring

```bash
# Terminal 1: Run application
npm start

# Terminal 2: Monitor logs (PowerShell)
Get-Content logs\combined.log -Wait -Tail 50
```

## Example 4: Custom Configuration

Edit `.env` for specific behavior:

```env
# Conservative posting schedule
MIN_POST_INTERVAL=180        # 3 hours minimum
MAX_POST_INTERVAL=360        # 6 hours maximum
DAILY_POST_TARGET=4          # Only 4 posts per day

# Aggressive engagement
DAILY_REPLY_TARGET=30        # 30 replies per day
MIN_REPLY_INTERVAL=3         # 3 minutes between replies

# Development/Testing
HEADLESS_MODE=false          # See browser
LOG_LEVEL=debug              # Verbose logging
```

## Example 5: Monitoring Content Queue

**Check what's queued:**
```bash
type data\content_queue.json
```

**Example Queue Item:**
```json
{
  "content_id": "a1b2c3d4-e5f6-7890",
  "text": "Just discovered a game-changing debugging technique. Sometimes the simplest solutions are the best! 🐛✨",
  "media_urls": [],
  "media_local_paths": [],
  "source_tweet_id": null,
  "source_author": "devuser123",
  "topic_tags": ["developer", "software"],
  "engagement_score": 245,
  "generation_timestamp": "2024-11-13T10:30:00.000Z",
  "status": "queued"
}
```

## Example 6: Checking Posted Tweets

```bash
type data\posted_tweets.json
```

**Example Posted Tweet:**
```json
{
  "post_id": "x7y8z9w0-v1u2-3456",
  "content_id": "a1b2c3d4-e5f6-7890",
  "posted_timestamp": "2024-11-13T12:45:00.000Z",
  "initial_likes": 0,
  "initial_retweets": 0,
  "final_engagement": {}
}
```

## Example 7: Daily Workflow

**Morning (9 AM):**
```bash
# Start application
npm start
```

**During Day:**
- Application runs automatically
- Posts 6-10 tweets throughout day
- Replies to 20-30 tweets
- Takes random breaks

**Evening (10 PM):**
- Application continues or can be stopped with `Ctrl+C`
- Session saved automatically

**Next Day:**
- Session restored from previous day
- No login required
- Continues from where it left off

## Example 8: Reviewing Generated Content

Before going live, review content quality:

```bash
# Generate content only
npm run content-only

# Check what was generated
type data\content_queue.json

# Review and manually edit if needed
# Then start posting
npm start
```

## Example 9: Troubleshooting Workflow

**If authentication fails:**
```bash
# Delete session
del config\session.json

# Try dry run
npm run dry-run

# Check logs
type logs\error.log
```

**If no content generated:**
```bash
# Check if trending tweets were found
# Look for "Scraped tweets" in logs
type logs\combined.log | findstr "Scraped"

# Lower engagement threshold
# Edit .env:
MIN_ENGAGEMENT_THRESHOLD=50

# Try again
npm run content-only
```

## Example 10: Stopping Gracefully

**Method 1: Ctrl+C**
```
Press Ctrl+C in terminal

Output:
Received SIGINT, shutting down gracefully...
[INFO] Shutting down orchestrator
[INFO] Browser closed
[INFO] Shutdown complete
```

**Method 2: System Signal**
```bash
# Find process
tasklist | findstr node

# Kill gracefully (allows cleanup)
taskkill /PID <pid> /T
```

## Example 11: Performance Metrics

**Check daily stats:**

```javascript
// Run in Node REPL or create script
import DataStore from './src/data/DataStore.js';
const store = new DataStore();

console.log('Posts today:', store.getPostedTweetsToday().length);
console.log('Replies today:', store.getRepliesToday().length);
console.log('Queue size:', store.getContentQueue().filter(i => i.status === 'queued').length);
```

## Example 12: Different Execution Modes Comparison

| Mode | Command | Authentication | Content Gen | Posting | Replies |
|------|---------|----------------|-------------|---------|---------|
| Dry Run | `npm run dry-run` | ✅ | ✅ | ❌ (simulated) | ❌ (simulated) |
| Content Only | `npm run content-only` | ✅ | ✅ | ❌ | ❌ |
| Production | `npm start` | ✅ | ✅ | ✅ | ✅ |
| Development | `npm run dev` | ✅ | ✅ | ✅ | ✅ |

## Example 13: Cleaning Up Old Data

```bash
# Manual cleanup
del /Q cache\media\*
del /Q data\*.json

# Or let app handle it automatically
# Runs every cycle, keeps:
# - Media: 24 hours
# - Data: 30 days
# - Logs: Managed by Winston rotation
```

## Example 14: Testing Different AI Models

Edit `.env` to try different models:

```env
# Most capable, higher cost
OPENAI_MODEL=gpt-5-mini

# Faster, cheaper
OPENAI_MODEL=gpt-3.5-turbo

# More creative
OPENAI_TEMPERATURE=0.9

# More conservative
OPENAI_TEMPERATURE=0.5
```

## Example 15: Scheduled Execution (Windows Task Scheduler)

Create a batch file `run-twitter-farm.bat`:
```batch
@echo off
cd D:\Projects\twitter-farm
call npm start
```

Schedule in Task Scheduler:
- Trigger: Daily at 8:00 AM
- Action: Run `run-twitter-farm.bat`
- Stop task after: 12 hours

## Pro Tips

1. **Start Conservative**: Use high intervals, low targets
2. **Monitor First Week**: Watch logs and Twitter activity
3. **Adjust Gradually**: Increase frequency if working well
4. **Use Dry Run Often**: Test changes before production
5. **Check Queue Health**: Should have 10-20 items ready
6. **Review Content**: Ensure AI outputs are appropriate
7. **Rotate API Keys**: If hitting rate limits
8. **Weekend Mode**: Multiplier automatically reduces activity

## Common Patterns

**Weekend Testing:**
```env
WEEKEND_FREQUENCY_MULTIPLIER=0.3  # Much slower
```

**Peak Hours Focus:**
```javascript
// In config.js, adjust:
peakHours: [[9, 11], [13, 15], [17, 19]]  # Only active during these hours
```

**Reply-Only Mode:**
```env
DAILY_POST_TARGET=0           # No posting
DAILY_REPLY_TARGET=50         # Lots of replies
```

---

**Need More Examples?** Check the logs - they show real execution flow!
