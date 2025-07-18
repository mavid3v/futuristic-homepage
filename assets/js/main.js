document.body.classList.add('loading');

window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('loading');
    // Optionally play a boot sound here
  }, 1000); // 1 sec delay
});


// ========== 1. Time & Date Updater ==========
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toDateString();

  document.getElementById('time').textContent = time;
  document.getElementById('date').textContent = date;
}

setInterval(updateClock, 1000);
updateClock(); // Run once on load

// ========== 2. Hover + Click Sounds ==========
const hoverSound = document.getElementById('hover-sound');
const clickSound = document.getElementById('click-sound');
const typeSound = document.getElementById('type-sound');
const backspaceSound = document.getElementById('backspace-sound');

document.querySelectorAll('input[type="text"], input[type="search"]').forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (!typeSound.muted) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        backspaceSound.currentTime = 0;
        backspaceSound.play();
      } else if (e.key.length === 1) {
        typeSound.currentTime = 0;
        typeSound.play();
      }
    }
  });
});

// Play hover sound on hoverable elements
document.querySelectorAll('a, .settings-btn, input').forEach(el => {
  el.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });

  el.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play();
  });
});

// ========== 3. Load Quote of the Day ==========
fetch('data/quotes.json')
  .then(res => res.json())
  .then(data => {
    const random = Math.floor(Math.random() * data.quotes.length);
    document.getElementById('quote').textContent = `"${data.quotes[random]}"`;
  })
  .catch(err => {
    document.getElementById('quote').textContent = '"Error loading thoughts…"';
    console.error('Quote fetch error:', err);
  });

// ========== Settings Panel Toggle ==========
const settingsBtn = document.querySelector('.settings-btn');
const settingsPanel = document.querySelector('.settings-panel');
const closeBtn = document.getElementById('close-settings');

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
});
closeBtn.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

// ========== 4. Settings Logic ==========

// DOM Elements
const themeSelect = document.getElementById('theme-select');
const soundToggle = document.getElementById('toggle-sound');
const bgToggle = document.getElementById('toggle-bg');
const backgroundDiv = document.querySelector('.background');

// ---- Apply Theme ----
function applyTheme(theme) {
  document.documentElement.style.setProperty('--neon', getThemeColor(theme));
}

function getThemeColor(theme) {
  switch (theme) {
    case 'green': return '#00ff99';
    case 'red': return '#ff0055';
    case 'purple': return '#a600ff';
    default: return '#00f0ff';
  }
}

// ---- Load Saved Settings ----
function loadSettings() {
  const savedTheme = localStorage.getItem('theme') || 'blue';
  const soundOn = localStorage.getItem('sound') !== 'off';
  const bgOn = localStorage.getItem('background') !== 'off';

  themeSelect.value = savedTheme;
  soundToggle.checked = soundOn;
  bgToggle.checked = bgOn;

  applyTheme(savedTheme);
  backgroundDiv.style.display = bgOn ? 'block' : 'none';
  muteAllSounds(!soundOn);
}

loadSettings();

// ---- Save + Apply on Change ----
themeSelect.addEventListener('change', () => {
  const selected = themeSelect.value;
  localStorage.setItem('theme', selected);
  applyTheme(selected);
});

soundToggle.addEventListener('change', () => {
  const enabled = soundToggle.checked;
  localStorage.setItem('sound', enabled ? 'on' : 'off');
  muteAllSounds(!enabled);
});

bgToggle.addEventListener('change', () => {
  const enabled = bgToggle.checked;
  backgroundDiv.style.display = enabled ? 'block' : 'none';
  localStorage.setItem('background', enabled ? 'on' : 'off');
});

// ---- Helper to Mute Sounds ----
function muteAllSounds(muted) {
  hoverSound.muted = muted;
  clickSound.muted = muted;
}

// ========== Animated Starfield ==========
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Create stars
for (let i = 0; i < 200; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * canvas.width,
  });
}

function animateStars() {
  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim();
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];

    star.z -= 2;
    if (star.z <= 0) {
      star.z = canvas.width;
    }

    let k = 128.0 / star.z;
    let x = star.x * k + canvas.width / 2;
    let y = star.y * k + canvas.height / 2;

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const size = (1 - star.z / canvas.width) * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  requestAnimationFrame(animateStars);
}
animateStars();
