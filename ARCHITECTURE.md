# Twitter Farm - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application Entry                        │
│                           (index.js)                             │
│                     CLI Arguments Parser                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR                             │
│                    (Main Workflow Manager)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Coordinates all operations                            │  │
│  │  • Manages scheduling and timing                         │  │
│  │  • Decides next action (post/engage/idle)                │  │
│  │  • Handles graceful shutdown                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────┬─────────┬─────────┬──────────┬──────────┬────────────┬────┘
     │         │         │          │          │            │
     ▼         ▼         ▼          ▼          ▼            ▼
┌─────────┐ ┌──────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Browser  │ │ Auth │ │ Twitter  │ │  Post  │ │Engage  │ │  Data  │
│Control  │ │ Mgr  │ │ Scraper  │ │  Mgr   │ │ Engine │ │ Store  │
└────┬────┘ └──┬───┘ └────┬─────┘ └───┬────┘ └────┬───┘ └───┬────┘
     │         │          │            │           │         │
     └─────────┴──────────┴────────────┴───────────┴─────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        ┌──────────┐             ┌──────────┐
        │    AI    │             │  Media   │
        │ Service  │             │ Handler  │
        └──────────┘             └──────────┘
```

## Component Interaction Flow

### 1. Startup Flow
```
index.js
    ↓
Load Config & Validate
    ↓
Initialize Orchestrator
    ↓
Initialize Browser Controller
    ↓
Authentication Manager
    ├─→ Try Restore Session (SessionManager)
    │   ├─→ Success: Continue
    │   └─→ Fail: Fresh Login
    └─→ Validate Session
    ↓
Initialize Services
    ├─→ Twitter Scraper
    ├─→ Post Manager
    └─→ Engagement Engine
    ↓
Start Main Loop
```

### 2. Content Generation Flow
```
Orchestrator checks queue
    ↓
Queue low? → Yes
    ↓
Twitter Scraper
    ├─→ Navigate to /explore
    ├─→ Scrape trending tweets
    ├─→ Filter by developer keywords
    └─→ Exclude crypto/political
    ↓
For each tweet:
    ├─→ AI Service generates variation
    ├─→ Media Handler downloads images
    └─→ Data Store saves to queue
    ↓
Return to main loop
```

### 3. Posting Flow
```
Orchestrator decides: POST
    ↓
Get next content from queue
    ↓
Post Manager
    ├─→ Navigate to compose
    ├─→ Type text (human-like speed)
    ├─→ Upload media (if present)
    ├─→ Click post button
    └─→ Verify posted
    ↓
Update Data Store
    ├─→ Mark content as 'posted'
    └─→ Record in posted_tweets.json
    ↓
Calculate random delay (90-240 min)
    ↓
Sleep until next action
```

### 4. Engagement Flow
```
Orchestrator decides: ENGAGE
    ↓
Engagement Engine
    ├─→ Navigate to /home
    ├─→ Scroll timeline
    └─→ Scrape tweets
    ↓
Filter targets:
    ├─→ Contains dev keywords
    ├─→ Not already replied
    └─→ Shuffle randomly
    ↓
For each target (1-3):
    ├─→ AI Service analyzes sentiment
    ├─→ AI Service generates reply
    ├─→ Navigate to tweet
    ├─→ Click reply button
    ├─→ Type reply text
    └─→ Post reply
    ↓
Record in replies.json
    ↓
Random delay (5-30 min)
```

### 5. Idle Flow
```
Orchestrator decides: IDLE
    ↓
Daily targets met
    ↓
Calculate break duration
    ├─→ Min: 30 minutes
    └─→ Max: 90 minutes
    ↓
Sleep (simulate human break)
    ↓
Resume main loop
```

## Data Flow

```
┌──────────────┐
│ Trending     │
│ Tweets       │
└──────┬───────┘
       │ scraped
       ▼
┌──────────────┐
│ Tweet Text   │
│ + Media      │
└──────┬───────┘
       │ sent to
       ▼
┌──────────────┐      ┌──────────────┐
│ AI Service   │◄─────┤ OpenAI API   │
└──────┬───────┘      └──────────────┘
       │ generated variation
       ▼
┌──────────────┐
│ Content      │
│ Queue        │
└──────┬───────┘
       │ dequeue
       ▼
┌──────────────┐
│ Post to      │
│ Twitter      │
└──────┬───────┘
       │ success
       ▼
┌──────────────┐
│ Posted       │
│ History      │
└──────────────┘
```

## File System Organization

```
config/
└── session.json         ← Cookie storage

data/
├── content_queue.json   ← Generated tweets waiting
├── posted_tweets.json   ← Posted tweet history
└── replies.json         ← Reply history

cache/media/
└── *.jpg, *.png         ← Downloaded images (temp)

logs/
├── combined.log         ← All activity
└── error.log           ← Errors only

browser-data/            ← Playwright user data (auto)
```

## Configuration Hierarchy

```
Environment Variables (.env)
    ↓
config.js (Centralized Config)
    ↓
Components read config
    ├─→ BrowserController (browser settings)
    ├─→ AuthenticationManager (credentials)
    ├─→ AIService (OpenAI key, model)
    ├─→ PostManager (selectors, timing)
    ├─→ EngagementEngine (targets, intervals)
    └─→ Orchestrator (all settings)
```

## Decision Tree: Next Action

```
Main Loop
    │
    ├─→ Check content queue
    │   └─→ Low? → Generate content
    │
    ├─→ Posted today < target?
    │   ├─→ Yes: 50% chance → POST
    │   └─→ No: Skip
    │
    ├─→ Replied today < target?
    │   ├─→ Yes: 50% chance → ENGAGE
    │   └─→ No: Skip
    │
    └─→ Both targets met? → IDLE
```

## State Management

```
┌──────────────────────────────────────┐
│        Application State              │
├──────────────────────────────────────┤
│  isRunning: boolean                   │
│  isAuthenticated: boolean             │
│  contentQueue: Array<Content>         │
│  postedToday: number                  │
│  repliedToday: number                 │
│  repliedTweets: Set<string>           │
└──────────────────────────────────────┘

Persisted to disk:
├─→ session.json (auth tokens)
├─→ content_queue.json (tweets)
├─→ posted_tweets.json (history)
└─→ replies.json (engagement)
```

## Error Handling Strategy

```
Try Operation
    │
    ├─→ Success → Continue
    │
    └─→ Error
        │
        ├─→ Log error details
        │
        ├─→ Retryable? (auth, network, element not found)
        │   ├─→ Yes: Retry with backoff (max 3)
        │   └─→ No: Mark failed, continue
        │
        └─→ Critical? (auth failure, config invalid)
            ├─→ Yes: Shutdown gracefully
            └─→ No: Skip and continue
```

## Timing & Scheduling

```
Timeline (Example Day):

08:00 ────┬──── App starts
          │
08:05 ────┼──── Auth + Generate content
          │
08:30 ────●──── POST #1
          │
10:15 ────●──── Reply batch (3 tweets)
          │
11:00 ────●──── POST #2
          │
11:30 ─────────── Idle break (45 min)
          │
12:15 ────●──── Reply batch (2 tweets)
          │
14:00 ────●──── POST #3
          │
14:30 ─────────── Idle break (60 min)
          │
15:30 ────●──── Reply batch (3 tweets)
          │
17:00 ────●──── POST #4
          │
... continues with random intervals ...
```

## Security Layers

```
┌─────────────────────────────────────┐
│  Environment Variables (.env)        │
│  ├─── Not in Git                     │
│  └─── Validated on startup           │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Session Storage (encrypted)         │
│  ├─── Local file only                │
│  └─── 7-day expiration               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Logging (sanitized)                 │
│  ├─── Passwords redacted             │
│  ├─── API keys masked                │
│  └─── Rotation enabled               │
└─────────────────────────────────────┘
```

## Browser Automation Flow

```
Playwright
    ↓
Launch Chromium
    ├─→ Disable automation flags
    ├─→ Set realistic user agent
    ├─→ Configure viewport
    └─→ Add anti-detection scripts
    ↓
Create Context
    ├─→ Load cookies if exist
    ├─→ Set locale & timezone
    └─→ Configure timeouts
    ↓
Create Page
    ↓
Navigate to Twitter
    ├─→ Wait for load
    ├─→ Human-like delays
    ├─→ Random scrolling
    └─→ Variable typing speed
```

## Scalability Considerations

Current Implementation:
- ✅ Single account
- ✅ Single browser instance
- ✅ Sequential operations

Potential Extensions:
- 🔄 Multi-account support (separate sessions)
- 🔄 Parallel content generation
- 🔄 Distributed task queue
- 🔄 Redis for state management
- 🔄 Webhook notifications
- 🔄 Analytics dashboard

---

This architecture provides:
- **Modularity**: Easy to modify components
- **Testability**: Dry-run mode, isolated services
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Simple to add features
- **Reliability**: Error handling at every level
