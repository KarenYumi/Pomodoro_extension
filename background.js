const SESSIONS = [
  { mode: 'focus', duration: 45 * 60 },
  { mode: 'break', duration: 5 * 60 },
  { mode: 'focus', duration: 45 * 60 },
  { mode: 'break', duration: 5 * 60 },
  { mode: 'focus', duration: 45 * 60 },
  { mode: 'break', duration: 15 * 60 },
];

const ALARM_NAME = 'pomodoro-end';

function getDefaultState() {
  const first = SESSIONS[0];
  return {
    sessionIndex: 0,
    timeLeft: first.duration,
    totalTime: first.duration,
    mode: first.mode,
    isRunning: false,
    startTime: null,
    timeLeftAtStart: first.duration,
    cyclesDone: 0,
  };
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set(getDefaultState());
});

chrome.action.onClicked.addListener(() => {
  openPopupWindow();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    chrome.storage.local.get(['isRunning', 'timeLeft'], (data) => toggleTimer(data))
  }
  if (message.action === 'reset') {
    chrome.alarms.clear(ALARM_NAME);
    chrome.storage.local.set(getDefaultState());
  };
});

function toggleTimer(data) {
  if (data.isRunning === true) {
    chrome.alarms.clear(ALARM_NAME)
    chrome.storage.local.set({ isRunning: false });
  } else {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: 1 / 60
    })
    chrome.storage.local.set({
      isRunning: true,
      startTime: Date.now(),
      timeLeftAtStart: data.timeLeft
    });
  }
}

async function playSound() {
  const contexts = await chrome.runtime.getContexts({});
  const hasOffscreen = contexts.some(c => c.contextType === 'OFFSCREEN_DOCUMENT');
  if (hasOffscreen) await chrome.offscreen.closeDocument();
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play timer end sound',
  });
}

let popupWindowId = null;

async function openPopupWindow() {
  const url = chrome.runtime.getURL('popup/popup.html');

  if (popupWindowId !== null) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch {
      popupWindowId = null;
    }
  }

  const win = await chrome.windows.create({ url, type: 'popup', width: 240, height: 290, focused: true });
  popupWindowId = win.id;

  chrome.windows.onRemoved.addListener(function onRemoved(id) {
    if (id === popupWindowId) {
      popupWindowId = null;
      chrome.windows.onRemoved.removeListener(onRemoved);
    }
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  chrome.storage.local.get(null, (data) => {
    if (!data.isRunning) return;

    const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
    const timeLeft = Math.max(0, data.timeLeftAtStart - elapsed);

    if (timeLeft <= 0) {
      chrome.alarms.clear(ALARM_NAME);

      const nextIndex = (data.sessionIndex + 1) % SESSIONS.length;
      const nextSession = SESSIONS[nextIndex];

      chrome.storage.local.set({
        sessionIndex: nextIndex,
        timeLeft: nextSession.duration,
        totalTime: nextSession.duration,
        mode: nextSession.mode,
        isRunning: false,
        startTime: null,
        timeLeftAtStart: nextSession.duration,
        cyclesDone: nextIndex === 0 ? data.cyclesDone + 1 : data.cyclesDone,
      });
      playSound();
      openPopupWindow();
    } else {
      chrome.storage.local.set({ timeLeft });
    }
  });
});
