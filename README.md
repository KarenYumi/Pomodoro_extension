# 🍊 Pomelo — Pomodoro Timer Extension

A browser extension that adapts the Pomodoro technique to match the brain's natural focus span. Instead of the traditional 25-minute sessions, Pomelo uses three 45-minute focus blocks separated by short breaks, finishing with a longer recovery break.

> Built by [@KarenYumi](https://github.com/KarenYumi) — [View Repository](https://github.com/KarenYumi/Pomodoro_extension)

---

## 📸 Screenshots

<img width="217" height="247" alt="image" src="https://github.com/user-attachments/assets/a046bc30-f8f0-4da7-8482-ed8575df8f7a" />


---

## Session Structure

Each full cycle consists of 6 sessions:

| # | Type | Duration |
|---|------|----------|
| 1 | 🔴 Focus | 45 minutes |
| 2 | 🟡 Short Break | 5 minutes |
| 3 | 🔴 Focus | 45 minutes |
| 4 | 🟡 Short Break | 5 minutes |
| 5 | 🔴 Focus | 45 minutes |
| 6 | 🟢 Long Break | 15 minutes |

After the long break, the cycle restarts from the beginning. Completed cycles are tracked and displayed in the popup.

---

## ✨ Features

### Timer
- Countdown timer displaying time in `MM:SS` format
- Automatically transitions between focus and break sessions
- Continues running in the background even when the popup is closed

### Animated Progress Circle
- SVG ring that fills up during focus sessions as time passes
- Empties during break sessions as time passes
- Color-coded to match the Pomelo theme (orange-red tones)

### Play / Pause
- Single button to start or pause the current session
- Icon switches between play and pause states automatically

### Reset
- Resets the timer back to the beginning of the current session
- Clears all storage and returns to the default state

### Session Mode Label
- Displays whether the current session is **Focus** or **Break**
- Updates automatically when sessions transition

### Cycle Counter
- Tracks how many full cycles have been completed
- Persists across browser sessions using `chrome.storage`

### Auto Popup
- When a session ends, the popup window opens automatically so you never miss a transition

---

## Project Structure

```
pomodoro-extension/
├── manifest.json          # Extension configuration and permissions
├── background.js          # Service worker: timer logic, alarms, notifications
├── popup/
│   ├── popup.html         # Extension UI structure
│   ├── popup.css          # Styles and Pomelo theme
│   └── popup.js           # Display logic and user interactions
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── fonts/
    └── Quicksand-VariableFont_wght.ttf
```

---

## How It Works

### `background.js` — Service Worker
The core of the timer. Runs in the background independently of the popup being open.

- Initializes default state on install via `chrome.runtime.onInstalled`
- Uses `chrome.alarms` to tick every second
- On each tick, calculates elapsed time using `Date.now() - startTime` for precision (avoids drift if an alarm fires late)
- Handles session transitions automatically, cycling through the `SESSIONS` array
- Listens for `toggle` and `reset` messages from the popup
- Sends system notifications and opens the popup window when a session ends

### `popup.js` — Display Layer
Responsible only for showing the current state — it does not control the timer directly.

- Reads state from `chrome.storage.local` when the popup opens
- Listens to `chrome.storage.onChanged` to update the display in real time as the background ticks
- Sends `toggle` and `reset` messages to `background.js` when the user clicks the buttons
- Updates the SVG progress circle using `strokeDashoffset` calculations based on `timeLeft / totalTime`

### `popup.html` / `popup.css`
- Popup sized to 220×270px
- SVG circle with two overlapping `<circle>` elements: a static background ring and an animated progress ring
- Custom font: [Quicksand](https://fonts.google.com/specimen/Quicksand)
- Pomelo color palette: `#f35e31` (red-orange) and `#FFCC59` (orange)

---

## Installation (Developer Mode)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the `pomodoro-extension` folder
6. The Pomelo icon will appear in your browser toolbar

---

## Permissions

| Permission | Reason |
|------------|--------|
| `storage` | Saves timer state so it persists when the popup is closed |
| `alarms` | Triggers the timer tick every second in the background |
| `windows` | Opens the popup window automatically when a session ends |
| `offscreen` | Creates an offscreen document to play audio notifications in the background |

---

## Project Management

This project was organized using **GitHub Issues** and a **Kanban board** to track progress across four main areas:

- **Create basic structure** — folder setup, manifest, empty files
- **Create design of the animation** — SVG circle, CSS theme, layout
- **Implement functionalities and logic** — popup display, storage, messaging
- **Create background timer logic** — alarms, session transitions, notifications

Each issue was broken down into sub-issues to keep tasks small and focused, making it easier to track what was done and what was still pending throughout development.

---

## Built With

- Vanilla JavaScript
- Chrome Extensions Manifest V3
- SVG animations
- `chrome.alarms` API
- `chrome.storage` API
- `chrome.notifications` API
- `chrome.windows` API

---

## 🤝 Development Process

This project was built with the assistance of [Claude](https://claude.ai) (by Anthropic) as a **learning mentor**. Rather than generating the code directly, Claude guided the development process — explaining concepts, pointing out mistakes, and asking questions to encourage independent problem-solving.
