# Twitter Farm - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
npx playwright install chromium
```

### Step 2: Configure Environment

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` and add your credentials:
```env
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
TWITTER_EMAIL=your_email@example.com
OPENAI_API_KEY=sk-your-openai-api-key
```

### Step 3: Test with Dry Run

Run the application in dry-run mode (no actual posting):

```bash
npm run dry-run
```

This will:
- ✅ Test authentication
- ✅ Scrape trending developer tweets
- ✅ Generate AI content variations
- ✅ Simulate posting (without actually posting)
- ✅ Simulate engagement (without actually replying)

### Step 4: Generate Content Only

To just generate content without posting:

```bash
npm run content-only
```

### Step 5: Run in Production

Once you're comfortable with dry-run results:

```bash
npm start
```

## 📋 Checklist

Before running in production mode, ensure:

- [ ] `.env` file is properly configured
- [ ] Tested successfully with `--dry-run`
- [ ] Reviewed generated content quality
- [ ] Checked Twitter account is in good standing
- [ ] Understood posting schedule (6-10 posts/day)
- [ ] Reviewed logs in dry-run mode

## 🎯 Expected Behavior

### On First Run

1. **Authentication**: Logs into Twitter/X
2. **Session Save**: Saves cookies for future runs
3. **Content Generation**: Scrapes 5-10 trending developer tweets
4. **AI Processing**: Generates variations using OpenAI
5. **Queue Building**: Adds content to posting queue

### During Operation

- **Posting**: 1 tweet every 90-240 minutes
- **Engagement**: 1-3 replies every 5-30 minutes
- **Breaks**: Random idle periods (30-90 minutes)
- **Content Refresh**: Generates new content when queue is low

### Console Output

```
==============================================
🐦 Twitter Farm - Browser Automation
==============================================
Mode: production
Dry Run: NO
Content Only: NO
==============================================

[INFO] Starting authentication...
[INFO] Session loaded successfully
[INFO] Scraping trending tweets...
[INFO] Generated 5 content items
[INFO] Posting tweet...
[INFO] Post successful, waiting 127 minutes
```

## 🛠️ Common Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Run in production mode |
| `npm run dry-run` | Test without posting |
| `npm run content-only` | Generate content only |
| `npm run dev` | Development mode |

## 📁 Important Files

| File/Folder | Purpose |
|-------------|---------|
| `.env` | Your configuration (don't commit!) |
| `config/session.json` | Saved Twitter session |
| `data/content_queue.json` | Generated content waiting to post |
| `logs/combined.log` | All application activity |
| `cache/media/` | Downloaded images |

## 🔍 Monitoring

### Check Logs

```bash
# View recent activity
type logs\combined.log | more

# Watch logs in real-time (PowerShell)
Get-Content logs\combined.log -Wait
```

### Check Content Queue

```bash
type data\content_queue.json
```

### Check Posted Tweets

```bash
type data\posted_tweets.json
```

## ⚠️ Troubleshooting

### "Authentication failed"

**Problem**: Can't log in to Twitter

**Solutions**:
1. Verify credentials in `.env`
2. Check for Twitter security email
3. Delete `config/session.json` and retry
4. Ensure account isn't locked

### "No suitable tweets found"

**Problem**: Not finding developer content

**Solutions**:
1. Lower `MIN_ENGAGEMENT_THRESHOLD` in `.env`
2. Run a few times - timeline varies
3. Check your Twitter "For You" feed has dev content

### "OpenAI API error"

**Problem**: AI content generation failing

**Solutions**:
1. Verify `OPENAI_API_KEY` in `.env`
2. Check API key has credits
3. Try different model (gpt-3.5-turbo)

## 🎓 Learning Path

1. **Day 1**: Run `--dry-run` mode, observe behavior
2. **Day 2**: Review generated content quality
3. **Day 3**: Adjust settings in `.env`
4. **Day 4**: Run `--content-only` to build queue
5. **Day 5**: Start production with monitoring

## 🔐 Security Reminders

- ✅ Never commit `.env` file
- ✅ Keep `OPENAI_API_KEY` secret
- ✅ Session file contains auth tokens
- ✅ Review logs before sharing
- ✅ Use dedicated Twitter account for testing

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. Review logs in `logs/combined.log`
3. Test with `--dry-run` first
4. Verify all configuration settings

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Authentication succeeds
- ✅ Content appears in queue
- ✅ Tweets post successfully (check Twitter)
- ✅ Replies appear on timeline
- ✅ No errors in logs

---

**Ready to Start?**

```bash
npm run dry-run
```

Then watch the console and logs to see the magic happen! 🚀
