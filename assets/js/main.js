// ========== Startup Loading Animation ==========
document.body.classList.add('loading');
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 1000);
});

// ========== Time & Date ==========
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toDateString();
  document.getElementById('time').textContent = time;
  document.getElementById('date').textContent = date;
}
setInterval(updateClock, 1000);
updateClock();

// ========== Sound Effects ==========
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

// ========== Quote of the Day ==========
fetch('data/quotes.json')
  .then(res => res.json())
  .then(data => {
    const random = Math.floor(Math.random() * data.quotes.length);
    document.getElementById('quote').textContent = `"${data.quotes[random]}"`;
  })
  .catch(() => {
    document.getElementById('quote').textContent = '"Error loading thoughts…"';
  });

// ========== Settings Panel ==========
const settingsBtn = document.querySelector('.settings-btn');
const settingsPanel = document.querySelector('.settings-panel');
const closeBtn = document.getElementById('close-settings');

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
});
closeBtn.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

// ========== Settings Logic ==========
const themeSelect = document.getElementById('theme-select');
const soundToggle = document.getElementById('toggle-sound');
const bgToggle = document.getElementById('toggle-bg');
const backgroundDiv = document.querySelector('.background');

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
function muteAllSounds(muted) {
  hoverSound.muted = muted;
  clickSound.muted = muted;
}
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
loadSettings();

// ========== Starfield ==========
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
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
  for (let star of stars) {
    star.z -= 2;
    if (star.z <= 0) star.z = canvas.width;
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

// ========== Search Box ==========
const searchInput = document.getElementById('search');
searchInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query !== '') {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_blank');
      searchInput.value = '';
    }
  }
});

// ========== Weather Widget ==========
const toggleWeather = document.getElementById('toggle-weather');
const weatherWidget = document.getElementById('weather-widget');
const apiKeyInput = document.getElementById('weather-api-key');
const weatherBox = document.getElementById('weather-info');
const unitToggle = document.getElementById('toggle-units');
const locationOverride = document.getElementById('override-location');
const infoIcon = document.getElementById('weather-info-icon');

const WEATHER_KEY = 'weatherAPIKey';
const WEATHER_ENABLED = 'weatherEnabled';
const USE_FAHRENHEIT = 'weatherFahrenheit';
const OVERRIDE_LOC = 'weatherOverrideLoc';

const API_STORAGE_KEY = 'weatherAPIKey';
const ENABLED_STORAGE_KEY = 'weatherEnabled';

function fetchWeather(lat, lon, key) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const city = data.name;
      const status = data.weather[0].main;
      weatherBox.innerHTML = `${city}: ${temp}°C — ${status}`;
    })
    .catch(() => {
      weatherBox.innerText = '⚠️ Invalid API key or connection';
    });
}

function initWeatherWidget() {
  const enabled = localStorage.getItem(ENABLED_STORAGE_KEY) === 'true';
  const apiKey = localStorage.getItem(API_STORAGE_KEY);

  toggleWeather.checked = enabled;
  if (apiKey) apiKeyInput.value = apiKey;

  if (enabled && apiKey) {
    weatherWidget.classList.remove('hidden');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, apiKey),
        () => fetchWeather(51.5074, -0.1278, apiKey)
      );
    } else {
      fetchWeather(51.5074, -0.1278, apiKey);
    }
  } else {
    weatherWidget.classList.add('hidden');
  }
}

toggleWeather.addEventListener('change', () => {
  const enabled = toggleWeather.checked;
  localStorage.setItem(ENABLED_STORAGE_KEY, enabled);
  initWeatherWidget();
});
apiKeyInput.addEventListener('change', () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem(API_STORAGE_KEY, key);
    initWeatherWidget();
  }
});
initWeatherWidget();

function fetchWeatherData(lat, lon, key, units) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${key}`)
    .then(res => res.json())
    .then(data => updateWeatherUI(data, units))
    .catch(() => showInfoMessage());
}

function fetchWeatherByName(city, key, units) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${key}`)
    .then(res => res.json())
    .then(data => updateWeatherUI(data, units))
    .catch(() => showInfoMessage());
}

function updateWeatherUI(data, units) {
  const iconCode = data.weather[0].icon;
  const iconURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const temp = Math.round(data.main.temp);
  const unitSymbol = units === 'imperial' ? '°F' : '°C';
  weatherBox.innerHTML = `<img src="${iconURL}" alt="" style="vertical-align:middle;width:2em;"> ${data.name}: ${temp}${unitSymbol}`;
  infoIcon.classList.add('hidden');
}

function showInfoMessage() {
  weatherBox.innerText = 'Weather unavailable';
  infoIcon.classList.remove('hidden');
}

function updateWeather() {
  const enabled = localStorage.getItem(WEATHER_ENABLED) === 'true';
  const key = localStorage.getItem(WEATHER_KEY);
  const units = localStorage.getItem(USE_FAHRENHEIT) === 'true' ? 'imperial' : 'metric';
  const override = localStorage.getItem(OVERRIDE_LOC);

  toggleWeather.checked = enabled;
  unitToggle.checked = units === 'imperial';
  apiKeyInput.value = key || '';
  locationOverride.value = override || '';

  if (enabled && key) {
    weatherWidget.classList.remove('hidden');
    if (override) {
      fetchWeatherByName(override, key, units);
    } else {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeatherData(pos.coords.latitude, pos.coords.longitude, key, units),
        () => fetchWeatherData(51.5074, -0.1278, key, units)
      );
    }
    clearInterval(window.weatherTimer);
    window.weatherTimer = setInterval(updateWeather, 900000); // 15 min
  } else {
    clearInterval(window.weatherTimer);
    weatherBox.innerText = enabled ? '…waiting for API key' : 'Weather disabled';
    infoIcon.classList.remove('hidden');
  }
}

toggleWeather.addEventListener('change', () => {
  localStorage.setItem(WEATHER_ENABLED, toggleWeather.checked);
  updateWeather();
});
unitToggle.addEventListener('change', () => {
  localStorage.setItem(USE_FAHRENHEIT, unitToggle.checked);
  updateWeather();
});
apiKeyInput.addEventListener('change', () => {
  localStorage.setItem(WEATHER_KEY, apiKeyInput.value.trim());
  updateWeather();
});
locationOverride.addEventListener('change', () => {
  localStorage.setItem(OVERRIDE_LOC, locationOverride.value.trim());
  updateWeather();
});
infoIcon.addEventListener('click', () => {
  alert('Enable weather from settings and enter your OpenWeather API key.');
});

updateWeather();
