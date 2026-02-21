# Architecture — MaxTaskX

## Overview

MaxTaskX (Royal Task Ticker) — геймифицированный ежедневный таск-менеджер с блокировкой TikTok, Pomodoro-таймером, анимациями монет и напоминаниями. Express-сервер + React-клиент.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Server | Express.js (Node.js) |
| Client | React (vanilla JS, no TypeScript) |
| Styling | CSS (index.css) |
| Persistence | In-memory (server), localStorage (client) |
| Sound | Web Audio API (wav files) |
| Deploy | Replit |

## Project Structure

```
├── server.js                    # Express server — API + static files
├── package.json                 # Dependencies
├── public/
│   ├── index.html               # SPA entry point
│   └── manifest.json            # PWA manifest
├── src/
│   ├── App.js                   # Root component
│   ├── index.js                 # React entry
│   ├── index.css                # Global styles
│   ├── components/
│   │   ├── TaskEditor.js        # Text-area task input (timed + general)
│   │   ├── TaskList.js          # Rendered task list
│   │   ├── WorkingMode.js       # 1-hour focus mode toggle
│   │   ├── ReminderPopup.js     # Reminder overlay
│   │   └── Leaderboard.js       # Gamification leaderboard
│   └── utils/
│       ├── taskParser.js        # Parse "HH:MM description" format
│       ├── storage.js           # localStorage helpers
│       ├── animations.js        # Coin drop animations
│       ├── reminderSystem.js    # Reminder check loop
│       └── androidBridge.js     # Android WebView bridge
└── attached_assets/             # Sound effects (wav)
```

## Server API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/tasks` | Get all tasks + completed state |
| POST | `/api/tasks` | Save raw task text |
| POST | `/api/complete-task` | Mark task complete |
| POST | `/api/working-mode` | Toggle 1-hour focus mode |
| GET | `/api/reminder-check` | Check if reminders should fire |

## Task Format

```
9:00 Утренняя пробежка       → timed task (fires at 9:00)
Прочитать 30 страниц          → general task (no time)
```

## Key Concepts

- **Daily reset** — `shouldResetDaily()` сбрасывает completed tasks каждый день
- **Working Mode** — блокирует напоминания на 1 час
- **Gamification** — монетки, звуки, leaderboard
- **Android bridge** — `androidBridge.js` для WebView-интеграции
