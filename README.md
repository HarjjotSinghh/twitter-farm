# Twitter Farm - Browser Automation Application

A sophisticated browser automation application built with Playwright that automates Twitter/X engagement through AI-generated content, strategic posting, and intelligent replies focused on software development topics.

## 🎯 Features

- **Automated Authentication**: Session-based login with cookie persistence
- **AI-Powered Content Generation**: Uses OpenAI GPT to create engaging developer-focused tweets
- **Trend Analysis**: Scrapes trending tweets and generates variations
- **Media Support**: Downloads and re-uploads images from source tweets
- **Smart Scheduling**: Randomized posting intervals with peak hour optimization
- **Intelligent Engagement**: AI-generated replies to high-engagement tweets
- **Human-Like Behavior**: Typing delays, random intervals, and natural scrolling
- **Dry-Run Mode**: Test without actually posting
- **Comprehensive Logging**: Detailed activity tracking and error handling

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)
- Twitter/X account
- OpenAI API key
- 8GB RAM recommended
- Stable internet connection

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd twitter-farm
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Configure Environment

Copy the example environment file and configure it:

```bash
copy .env.example .env
```

Edit `.env` with your credentials:

```env
# Twitter/X Account
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email@example.com

# OpenAI API
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4

# Application Settings
NODE_ENV=development
LOG_LEVEL=info
HEADLESS_MODE=false
```

### 4. Run the Application

**Normal mode (continuous operation):**
```bash
npm start
```

**Dry-run mode (no actual posting):**
```bash
npm run dry-run
```

**Content generation only:**
```bash
npm run content-only
```

**Development mode:**
```bash
npm run dev
```

## 📁 Project Structure

```
twitter-farm/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration management
│   ├── core/
│   │   ├── BrowserController.js   # Playwright browser control
│   │   ├── SessionManager.js      # Cookie & session persistence
│   │   └── AuthenticationManager.js # Twitter login handling
│   ├── services/
│   │   ├── AIService.js           # OpenAI integration
│   │   ├── MediaHandler.js        # Media download/upload
│   │   └── TwitterScraper.js      # Trend analysis & scraping
│   ├── managers/
│   │   ├── PostManager.js         # Tweet posting
│   │   └── EngagementEngine.js    # Reply generation
│   ├── orchestrator/
│   │   └── Orchestrator.js        # Main workflow coordinator
│   ├── data/
│   │   └── DataStore.js           # Data persistence
│   ├── utils/
│   │   ├── logger.js              # Winston logging
│   │   └── helpers.js             # Utility functions
│   └── index.js                   # Application entry point
├── config/                        # Session storage (auto-created)
├── cache/media/                   # Downloaded media (auto-created)
├── data/                          # Content queue & metrics (auto-created)
├── logs/                          # Application logs (auto-created)
├── .env                           # Environment configuration
├── .env.example                   # Environment template
├── package.json                   # Dependencies
└── README.md                      # This file
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TWITTER_USERNAME` | Your Twitter username | Required |
| `TWITTER_PASSWORD` | Your Twitter password | Required |
| `TWITTER_EMAIL` | Email for verification | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | AI model to use | gpt-4 |
| `HEADLESS_MODE` | Run browser headless | false |
| `MIN_POST_INTERVAL` | Min minutes between posts | 90 |
| `MAX_POST_INTERVAL` | Max minutes between posts | 240 |
| `DAILY_POST_TARGET` | Target posts per day | 8 |
| `DAILY_REPLY_TARGET` | Target replies per day | 20 |

See `.env.example` for all available options.

### Content Filters

The application focuses on developer/SWE topics and excludes:
- Cryptocurrency and NFT content
- Political content
- Financial advice
- Controversial topics

Keywords are configured in `src/config/config.js`.

## 🔧 Usage

### Running Modes

**1. Continuous Mode (Production)**
```bash
npm start
```
Runs indefinitely with configured schedule.

**2. Dry-Run Mode (Testing)**
```bash
npm run dry-run
```
Simulates all actions without posting.

**3. Content-Only Mode**
```bash
npm run content-only
```
Generates content and exits.

### Monitoring

Logs are stored in:
- `logs/combined.log` - All activity
- `logs/error.log` - Errors only

Real-time console output shows:
- Authentication status
- Content generation
- Posting activity
- Engagement actions
- Errors and warnings

### Data Storage

Application data is stored in `data/`:
- `content_queue.json` - Generated content queue
- `posted_tweets.json` - Posted tweet history
- `replies.json` - Reply history

Session data is stored in `config/session.json`.

## 🛡️ Safety & Best Practices

1. **Start with Dry-Run**: Always test with `--dry-run` first
2. **Monitor Initially**: Watch logs during first few cycles
3. **Rate Limiting**: Built-in delays prevent platform restrictions
4. **Session Persistence**: Reduces login frequency
5. **Error Recovery**: Automatic retry with exponential backoff
6. **Content Review**: Check generated content quality in dry-run mode

## 🔍 Troubleshooting

### Authentication Issues

**Problem**: Login fails or session not restored
**Solution**: 
- Verify credentials in `.env`
- Delete `config/session.json` to force fresh login
- Check for Twitter security alerts

### Content Generation Issues

**Problem**: No suitable tweets found
**Solution**:
- Adjust `MIN_ENGAGEMENT_THRESHOLD` in `.env`
- Expand developer keywords in `config.js`
- Check if timeline has developer content

### Posting Failures

**Problem**: Posts fail to publish
**Solution**:
- Check Twitter API status
- Verify account isn't rate limited
- Update selectors if Twitter UI changed

### Browser Issues

**Problem**: Playwright browser crashes
**Solution**:
- Reinstall browsers: `npx playwright install`
- Increase system resources
- Disable headless mode for debugging

## 📊 Performance

- **Memory Usage**: ~500MB average
- **CPU Usage**: Low (browser automation)
- **Disk Usage**: ~100MB logs/cache
- **Network**: Moderate (scraping and AI API calls)

## 🔐 Security

- Credentials stored in `.env` (never commit)
- Session cookies encrypted and local
- No sensitive data in logs
- API keys redacted in output

## 📝 License

MIT License - See LICENSE file

## ⚠️ Disclaimer

This application is for educational and research purposes. Users are responsible for complying with Twitter/X Terms of Service and applicable laws. Use responsibly and ethically.

## 🤝 Support

For issues, questions, or contributions:
1. Check existing documentation
2. Review logs for error details
3. Test in dry-run mode
4. Report issues with full context

## 🎓 Training Purpose

This project was created as a training tool to understand and prevent automated bot activity on Twitter/X platform.

---

**Version**: 1.0.0  
**Last Updated**: November 2024
