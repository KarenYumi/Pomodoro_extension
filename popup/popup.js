const CIRCUMFERENCE = 2 * Math.PI * 65;

function updateDisplayTimer(data) {
  const timeLeft = data.timeLeft;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formater = (numero) => String(numero).padStart(2, '0');

  const timer = document.getElementById('timer');
  timer.textContent = `${formater(minutes)}:${formater(seconds)}`;
}

function updateDisplayMode(data) {
  const mode = document.getElementById('mode');
  if (data.mode === 'focus') {
    mode.textContent = 'Focus';
  } else {
    mode.textContent = 'Break';
  }
}

function updateDisplayButton(data) {
  const play = document.getElementById('icon-play');
  const pause = document.getElementById('icon-pause');

  if (data.isRunning === true) {
    play.style.display = 'none';
    pause.style.display = 'block';
  } else {
    pause.style.display = 'none';
    play.style.display = 'block';
  }
}

function updateDisplayCircle(data) {
  const circle = document.getElementById('circle-progress');
  circle.style.strokeDasharray = CIRCUMFERENCE;
  circle.style.animation = 'none';

  const timeLeft = data.timeLeft ?? 0;
  const totalTime = data.totalTime ?? timeLeft;

  let progress;
  if (data.mode === 'break') {
    progress = totalTime > 0 ? timeLeft / totalTime : 0;
  } else {
    const elapsed = totalTime - timeLeft;
    progress = totalTime > 0 ? elapsed / totalTime : 0;
  }

  const offset = CIRCUMFERENCE * (1 - progress);

  circle.style.strokeDashoffset = offset;
  circle.style.display = progress > 0 ? 'block' : 'none';
}

function updateDisplay(data) {
  updateDisplayTimer(data);
  updateDisplayMode(data);
  updateDisplayButton(data);
  updateDisplayCircle(data);
}

chrome.storage.local.get(['timeLeft', 'totalTime', 'isRunning', 'mode'], updateDisplay);

chrome.storage.onChanged.addListener((_changes, area) => {
  if (area !== 'local') return;
  chrome.storage.local.get(['timeLeft', 'totalTime', 'isRunning', 'mode'], updateDisplay);
});

document.querySelector('.button-play').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'toggle' });
});

document.getElementById('btn-reset').addEventListener('click', () => {
  chrome.storage.local.clear(() => {
    chrome.runtime.sendMessage({ action: 'reset' });
  });
});