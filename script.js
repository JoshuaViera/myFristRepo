// Consolidated JavaScript for time/date, theme toggle, and quote functionality
  function _mainDOMContentLoaded() {
  console.info('script.js: DOMContentLoaded handler running');

  // --- Temporary debugging helpers (remove after we finish debugging) ---
  (function setupDevLog() {
    try {
      const devLog = document.createElement('div');
      devLog.id = 'dev-log';
      devLog.style.position = 'fixed';
      devLog.style.right = '12px';
      devLog.style.bottom = '12px';
      devLog.style.width = '320px';
      devLog.style.maxHeight = '40vh';
      devLog.style.overflow = 'auto';
      devLog.style.background = 'rgba(255, 255, 255, 0.85)';
      devLog.style.color = '#fff';
      devLog.style.fontSize = '12px';
      devLog.style.padding = '8px';
      devLog.style.borderRadius = '6px';
      devLog.style.zIndex = 99999;
      devLog.style.fontFamily = 'monospace';
      devLog.innerHTML = '<strong>DEV LOG</strong><br/>';
      document.body.appendChild(devLog);

      function append(msg, level='info') {
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.textContent = `[${time}] ${msg}`;
        line.style.marginTop = '4px';
        if (level === 'error') line.style.color = '#ff6b6b';
        devLog.appendChild(line);
        devLog.scrollTop = devLog.scrollHeight;
        // also mirror to console
        console[level === 'error' ? 'error' : 'log']('[dev-log]', msg);
      }

      window.__devLog = append;

      window.addEventListener('error', (e) => {
        append(`Uncaught error: ${e.message} @ ${e.filename || ''}:${e.lineno || ''}`, 'error');
      });
      window.addEventListener('unhandledrejection', (ev) => {
        append(`UnhandledRejection: ${ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason)}`, 'error');
      });

      document.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('button');
        if (btn) {
          append(`CLICK: id=${btn.id || 'n/a'} data-action=${btn.dataset.action || 'n/a'} text="${(btn.textContent||'').trim().slice(0,40)}"`);
        }
      }, true);

      // Wrap addEventListener to surface handler exceptions to the dev log. This is temporary.
      const _add = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (typeof listener === 'function') {
          const wrapped = function(...args) {
            try { return listener.apply(this, args); }
            catch (err) { append(`Handler error (${type}): ${err && err.stack ? err.stack.split('\n')[0] : err}`, 'error'); throw err; }
          };
          // store reference for potential removal (best-effort)
          wrapped.__original = listener;
          return _add.call(this, type, wrapped, options);
        }
        return _add.call(this, type, listener, options);
      };
    } catch (e) {
      console.warn('setupDevLog failed', e);
    }
  })();

  // Application namespace to reduce global scope pollution
  const App = {
    DEBUG: false,
    debug: function(...args) { if (App.DEBUG) console.log('[App debug]', ...args); }
  };
  // ensure `App` is available to feature modules (they import after legacy script)
  // if a global `window.App` already exists (loader or previously-loaded module), merge into it
  if (!window.App) {
    window.App = App;
    window.App.features = window.App.features || {};
    window.App.utils = window.App.utils || {};
  } else {
    // preserve any pre-registered feature modules and utilities
    window.App.features = window.App.features || {};
    window.App.utils = window.App.utils || {};
    Object.assign(window.App, App);
  }

  // local aliases (keep local App.features and utils referencing the global objects)
  App.features = window.App.features;
  App.utils = window.App.utils;
  // small alias for backwards-friendly usage in this file
  const DEBUG = App.DEBUG;
  const debug = App.debug;

  // ===== TIME/DATE FUNCTIONALITY =====
  const dateEl = document.getElementById('date');
  const nyTimeEl = document.getElementById('time-ny');

  function pad(n){ return n.toString().padStart(2,'0'); }

  function updateDateAndTime(){
    const now = new Date();
    // local date (top-left)
    const localDate = now.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
    if (dateEl) dateEl.textContent = localDate;

    // New York time in standard (12-hour) format with AM/PM
    // Ensure legacy feature registry entries exist without invoking undefined functions.
    try {
      App.features = App.features || {};
      App.features.initPacman = App.features.initPacman || function() { console.warn('Pacman module not loaded yet.'); };
    } catch (e) {
      console.warn('updateDateAndTime: failed to ensure App.features', e);
    }
    // Format and show New York time (falls back to local time if Intl timezone unsupported)
    try {
      if (nyTimeEl) {
        let nyTime;
        try {
          nyTime = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'America/New_York' }).format(now);
        } catch (tzErr) {
          // fallback: compute using UTC offset for Eastern Time (approximate)
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          // Eastern Time offset: -4 or -5 hours depending on DST; use toLocaleString as safer fallback
          nyTime = new Date(utc - (4 * 60 * 60000)).toLocaleTimeString();
        }
        nyTimeEl.textContent = nyTime;
      }
    } catch (e) {
      console.warn('updateDateAndTime: failed to format NY time', e);
    }
    // Note: animateParticles is part of the particle demo and may live in a module; do not call it unguarded here.
  }

  // Apply saved theme and wire up theme toggle button
  (function setupThemeToggle() {
    try {
      const themeBtn = document.getElementById('themeBtn');
      const root = document.documentElement;
      const applyTheme = (theme) => {
        // styles.css uses `.theme-alt` for the alternate theme
        if (theme === 'alt') root.classList.add('theme-alt'); else root.classList.remove('theme-alt');
        // add a small animation class to container for visual feedback
        root.classList.add('theme-transition');
        setTimeout(() => root.classList.remove('theme-transition'), 500);
        if (themeBtn) themeBtn.setAttribute('aria-pressed', theme === 'alt' ? 'true' : 'false');
      };
      // read persisted theme
      const saved = localStorage.getItem('siteTheme');
      if (saved) applyTheme(saved);

      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          const isAlt = root.classList.contains('theme-alt');
          const next = isAlt ? 'light' : 'alt';
          applyTheme(next);
          try { localStorage.setItem('siteTheme', next); } catch (e) {}
        });
      }
    } catch (e) { console.warn('setupThemeToggle failed', e); }
  })();

  // Start periodic date/time updates (defensive: only if the elements exist)
  try {
    if (dateEl || nyTimeEl) {
      updateDateAndTime();
      setInterval(updateDateAndTime, 1000);
    }
  } catch (e) { console.warn('Failed to start date/time updater', e); }

  // ===== NEURAL NETWORK VISUALIZER =====
  let neuralCanvas, neuralCtx, neuralNetwork;
  let trainingData = [];
  let isTraining = false;

  function initNeuralNetwork() {
    neuralCanvas = document.getElementById('neuralCanvas');
    if (!neuralCanvas) return;
    
    neuralCtx = neuralCanvas.getContext('2d');
    
    // Initialize simple neural network
    neuralNetwork = {
      weights: [Math.random() * 2 - 1, Math.random() * 2 - 1],
      bias: Math.random() * 2 - 1,
      learningRate: 0.1
    };
    
    // Generate initial training data
    generateTrainingData();
    
    // Event listeners
    document.getElementById('trainNetwork')?.addEventListener('click', trainNetwork);
    document.getElementById('resetNetwork')?.addEventListener('click', resetNetwork);
    document.getElementById('addData')?.addEventListener('click', addRandomDataPoint);
    
    const learningRateSlider = document.getElementById('learningRateSlider');
    const learningRateValue = document.getElementById('learningRateValue');
    if (learningRateSlider && learningRateValue) {
      learningRateSlider.addEventListener('input', (e) => {
        neuralNetwork.learningRate = parseFloat(e.target.value);
        learningRateValue.textContent = neuralNetwork.learningRate.toFixed(2);
      });
    }
    
    // Click to add data points
    neuralCanvas.addEventListener('click', (e) => {
      const rect = neuralCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      trainingData.push({
        x: x,
        y: y,
        label: Math.random() > 0.5 ? 1 : 0
      });
      
      drawNeuralNetwork();
    });
    
    drawNeuralNetwork();
  }

  function generateTrainingData() {
    trainingData = [];
    for (let i = 0; i < 50; i++) {
      trainingData.push({
        x: Math.random(),
        y: Math.random(),
        label: Math.random() > 0.5 ? 1 : 0
      });
    }
  }

  function addRandomDataPoint() {
    trainingData.push({
      x: Math.random(),
      y: Math.random(),
      label: Math.random() > 0.5 ? 1 : 0
    });
    drawNeuralNetwork();
  }

  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  function predict(x, y) {
    const z = neuralNetwork.weights[0] * x + neuralNetwork.weights[1] * y + neuralNetwork.bias;
    return sigmoid(z);
  }

  function trainNetwork() {
    if (isTraining) return;
    isTraining = true;
    
    let epochs = 0;
    const maxEpochs = 1000;
    
    function trainingStep() {
      let totalLoss = 0;
      
      for (let data of trainingData) {
        const prediction = predict(data.x, data.y);
        const error = data.label - prediction;
        const loss = error * error;
        totalLoss += loss;
        
        // Update weights and bias
        neuralNetwork.weights[0] += neuralNetwork.learningRate * error * data.x;
        neuralNetwork.weights[1] += neuralNetwork.learningRate * error * data.y;
        neuralNetwork.bias += neuralNetwork.learningRate * error;
      }
      
      epochs++;
      
      // Update UI
      const accuracy = calculateAccuracy();
      document.getElementById('accuracy').textContent = `${(accuracy * 100).toFixed(1)}%`;
      document.getElementById('epochs').textContent = epochs;
      document.getElementById('loss').textContent = (totalLoss / trainingData.length).toFixed(3);
      
      drawNeuralNetwork();
      
      if (epochs < maxEpochs && totalLoss > 0.01) {
        requestAnimationFrame(trainingStep);
      } else {
        isTraining = false;
      }
    }
    
    trainingStep();
  }

  function calculateAccuracy() {
    let correct = 0;
    for (let data of trainingData) {
      const prediction = predict(data.x, data.y);
      if ((prediction > 0.5 && data.label === 1) || (prediction <= 0.5 && data.label === 0)) {
        correct++;
      }
    }
    return correct / trainingData.length;
  }

  function resetNetwork() {
    neuralNetwork.weights = [Math.random() * 2 - 1, Math.random() * 2 - 1];
    neuralNetwork.bias = Math.random() * 2 - 1;
    trainingData = [];
    generateTrainingData();
    drawNeuralNetwork();
    
    document.getElementById('accuracy').textContent = '0%';
    document.getElementById('epochs').textContent = '0';
    document.getElementById('loss').textContent = '0.00';
  }

  function drawNeuralNetwork() {
    if (!neuralCtx) return;
    
    neuralCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    neuralCtx.fillRect(0, 0, neuralCanvas.width, neuralCanvas.height);
    
    // Draw decision boundary
    const imageData = neuralCtx.createImageData(neuralCanvas.width, neuralCanvas.height);
    const data = imageData.data;
    
    for (let y = 0; y < neuralCanvas.height; y++) {
      for (let x = 0; x < neuralCanvas.width; x++) {
        const normalizedX = x / neuralCanvas.width;
        const normalizedY = y / neuralCanvas.height;
        const prediction = predict(normalizedX, normalizedY);
        
        const alpha = Math.abs(prediction - 0.5) * 2;
        const color = prediction > 0.5 ? [0, 255, 128] : [255, 100, 100];
        
        const index = (y * neuralCanvas.width + x) * 4;
        data[index] = color[0];
        data[index + 1] = color[1];
        data[index + 2] = color[2];
        data[index + 3] = alpha * 255;
      }
    }
    
    neuralCtx.putImageData(imageData, 0, 0);
    
    // Draw training data points
    for (let data of trainingData) {
      const x = data.x * neuralCanvas.width;
      const y = data.y * neuralCanvas.height;
      
      neuralCtx.fillStyle = data.label === 1 ? '#00ff88' : '#ff4444';
      neuralCtx.beginPath();
      neuralCtx.arc(x, y, 6, 0, Math.PI * 2);
      neuralCtx.fill();
      
      neuralCtx.strokeStyle = '#ffffff';
      neuralCtx.lineWidth = 2;
      neuralCtx.stroke();
    }
  }

  // ===== MATRIX RAIN EFFECT =====
  let matrixCanvas, matrixCtx, matrixChars = [];
  let matrixAnimationId;
  let matrixColors = ['#00ff00', '#00ff88', '#88ff00'];
  let currentColorIndex = 0;
  let isGlitching = false;
  let glitchTimer = 0;

  function initMatrixRain() {
    matrixCanvas = document.getElementById('matrixCanvas');
    if (!matrixCanvas) return;
    
    matrixCtx = matrixCanvas.getContext('2d');
    matrixCtx.font = '15px monospace';
    
    const fontSize = 15;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    
    matrixChars = Array(columns).fill().map(() => ({
      y: Math.random() * matrixCanvas.height,
      speed: Math.random() * 2 + 1,
      char: String.fromCharCode(0x30A0 + Math.random() * 96)
    }));
    
    // Event listeners
    document.getElementById('toggleMatrix')?.addEventListener('click', toggleMatrixRain);
    document.getElementById('changeColor')?.addEventListener('click', changeMatrixColor);
    document.getElementById('glitchEffect')?.addEventListener('click', triggerGlitchEffect);
    
    const intensitySlider = document.getElementById('intensitySlider');
    const intensityValue = document.getElementById('intensityValue');
    if (intensitySlider && intensityValue) {
      intensitySlider.addEventListener('input', (e) => {
        const intensity = parseInt(e.target.value);
        intensityValue.textContent = intensity;
        updateMatrixIntensity(intensity);
      });
    }
  }

  /**
   * Initialize the particle system demo.
   * @public
   */
  // Avoid referencing an undeclared `initParticleSystem` which can throw a ReferenceError.
  // Use typeof guard and a safe no-op shim so modules can rely on App.features.registered names.
  App.features.initParticleSystem = App.features.initParticleSystem || (typeof initParticleSystem === 'function' ? initParticleSystem : function() { console.warn('Particle system init not available yet.'); });

  /**
   * Initialize the neural network visualizer demo.
   * @public
   */
  App.features.initNeuralNetwork = initNeuralNetwork;

  /**
   * Initialize the matrix rain demo.
   * @public
   */
  App.features.initMatrixRain = initMatrixRain;

  function animateMatrixRain() {
    if (!matrixCtx) return;
    
    // Handle glitch effect
    if (isGlitching) {
      glitchTimer--;
      if (glitchTimer <= 0) {
        isGlitching = false;
      }
      
      // Glitch effect: random screen disruption
      if (Math.random() > 0.7) {
        matrixCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        
        // Add random static lines
        matrixCtx.strokeStyle = '#ff0000';
        matrixCtx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          matrixCtx.beginPath();
          matrixCtx.moveTo(Math.random() * matrixCanvas.width, Math.random() * matrixCanvas.height);
          matrixCtx.lineTo(Math.random() * matrixCanvas.width, Math.random() * matrixCanvas.height);
          matrixCtx.stroke();
        }
      }
      
      // Corrupted text effect
      matrixCtx.fillStyle = isGlitching ? '#ff0000' : matrixColors[currentColorIndex];
    } else {
      matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      matrixCtx.fillStyle = matrixColors[currentColorIndex];
    }
    
    matrixChars.forEach((char, index) => {
      const x = index * 15;
      
      if (isGlitching && Math.random() > 0.8) {
        // Corrupted characters during glitch
        matrixCtx.fillText('█', x, char.y);
      } else {
        matrixCtx.fillText(char.char, x, char.y);
      }
      
      if (char.y > matrixCanvas.height && Math.random() > 0.975) {
        char.y = 0;
      }
      
      char.y += char.speed;
      
      if (Math.random() > 0.99) {
        char.char = String.fromCharCode(0x30A0 + Math.random() * 96);
      }
    });
    
    matrixAnimationId = requestAnimationFrame(animateMatrixRain);
  }

  function toggleMatrixRain() {
    if (matrixAnimationId) {
      cancelAnimationFrame(matrixAnimationId);
      matrixAnimationId = null;
      document.getElementById('toggleMatrix').textContent = 'Start Matrix';
    } else {
      animateMatrixRain();
      document.getElementById('toggleMatrix').textContent = 'Stop Matrix';
    }
  }

  function changeMatrixColor() {
    currentColorIndex = (currentColorIndex + 1) % matrixColors.length;
  }

  function triggerGlitchEffect() {
    isGlitching = true;
    glitchTimer = 60; // 60 frames of glitch effect
    
    // Visual feedback on button
    const button = document.getElementById('glitchEffect');
    button.style.background = 'linear-gradient(135deg, #ff0000, #ff4444)';
    button.textContent = 'GLITCHING...';
    
    setTimeout(() => {
      button.style.background = '';
      button.textContent = 'Glitch Effect';
    }, 1000);
  }

  function updateMatrixIntensity(intensity) {
    const numColumns = Math.floor((intensity / 100) * Math.floor(matrixCanvas.width / 15));
    matrixChars = matrixChars.slice(0, numColumns);
    
    while (matrixChars.length < numColumns) {
      matrixChars.push({
        y: Math.random() * matrixCanvas.height,
        speed: Math.random() * 2 + 1,
        char: String.fromCharCode(0x30A0 + Math.random() * 96)
      });
    }
  }

  // Demo initialization function
  function initializeDemo(demoType) {
    // prefer App.features registry when available (helps modular migration)
    const registry = App.features || {};
    switch(demoType) {
      case 'particles':
        (registry.initParticleSystem || initParticleSystem)();
        break;
      case 'neural':
        (registry.initNeuralNetwork || initNeuralNetwork)();
        break;
      case 'matrix':
        (registry.initMatrixRain || initMatrixRain)();
        break;
    }
  }

  // Initialize first demo on page load
  if (document.querySelector('.demo-tab.active')) {
    const activeDemo = document.querySelector('.demo-tab.active').dataset.demo;
    initializeDemo(activeDemo);
  }

  // Snake game moved to ES module: js/features/snake.js
  // Backwards-compatible initializer (will be overridden by module when imported)
  App.features.initSnakeGame = App.features.initSnakeGame || function() { console.warn('Snake module not loaded yet.'); };

  // Ping-Pong moved to ES module: js/features/pingpong.js
  App.features.initPingPongGame = App.features.initPingPongGame || function() { console.warn('PingPong module not loaded yet.'); };

  // ===== PAC-MAN LITE GAME FUNCTIONALITY =====
  let pacmanCanvas, pacmanCtx;
  let pacmanRunning = false;
  let pacmanPaused = false;
  let pacmanLoop = null;

  const tileSize = 18; // grid tile size (tuned for layout)
  const cols = 28; // playfield columns
  const rows = 20; // playfield rows

  // Simple maze: 0 = empty/pellet, 1 = wall, 2 = power-pellet
  // We'll generate a small bordered maze with some inner walls for demo
  let maze = [];
  let pellets = [];

  const pac = {
    x: 1,
    y: 1,
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed: 1
  };

  // multiple ghosts (will chase Pac-Man)
  let ghosts = [
    { x: cols - 2, y: rows - 2, color: '#ff6b6b' },
    { x: cols - 3, y: rows - 2, color: '#6bd1ff' },
    { x: cols - 2, y: rows - 3, color: '#c86bff' }
  ];

  // Gameplay tuning
  let pacTickMs = 120; // ms per pacman update
  let ghostBaseInterval = 260; // base ms per ghost step

  let pacmanState = {
    score: 0,
    lives: 3
  };

  function buildMaze() {
    maze = Array(rows).fill().map(() => Array(cols).fill(0));
    // border walls
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0 || r === rows -1 || c === 0 || c === cols -1) maze[r][c] = 1;
      }
    }
    // add some interior walls for a simple maze pattern
    for (let r = 2; r < rows -2; r+=4) {
      for (let c = 2; c < cols -2; c++) {
        if (c % 6 !== 0) maze[r][c] = 1;
      }
    }
    // place pellets wherever there's no wall
    pellets = [];
    for (let r = 1; r < rows -1; r++) {
      for (let c = 1; c < cols -1; c++) {
        if (maze[r][c] === 0) pellets.push({ x: c, y: r, power: false });
      }
    }
    // scatter a few power pellets
    for (let i = 0; i < 4; i++) {
      const idx = Math.floor(Math.random() * pellets.length);
      pellets[idx].power = true;
    }
  }

  function initPacman() {
    pacmanCanvas = document.getElementById('pacmanCanvas');
    if (!pacmanCanvas) return;
    pacmanCtx = pacmanCanvas.getContext('2d');

  buildMaze();
  pac.x = 1; pac.y = 1; pac.dir = {x:0,y:0}; pac.nextDir={x:0,y:0};
  // reset ghosts to starting positions
  ghosts[0].x = cols - 2; ghosts[0].y = rows - 2;
  ghosts[1].x = cols - 3; ghosts[1].y = rows - 2;
  ghosts[2].x = cols - 2; ghosts[2].y = rows - 3;
    pacmanState.score = 0; pacmanState.lives = 3;

    document.getElementById('startPacmanBtn')?.addEventListener('click', startPacman);
    document.getElementById('pausePacmanBtn')?.addEventListener('click', pausePacman);
    document.getElementById('resetPacmanBtn')?.addEventListener('click', resetPacman);

    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'ArrowUp': pac.nextDir = {x:0,y:-1}; e.preventDefault(); break;
        case 'ArrowDown': pac.nextDir = {x:0,y:1}; e.preventDefault(); break;
        case 'ArrowLeft': pac.nextDir = {x:-1,y:0}; e.preventDefault(); break;
        case 'ArrowRight': pac.nextDir = {x:1,y:0}; e.preventDefault(); break;
        case 'Space': if (!pacmanRunning) startPacman(); else pausePacman(); e.preventDefault(); break;
      }
    });

    // Touch controls: swipe to change direction, tap to start/pause
    let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
    let touchMoved = false;

    function onPacTouchStart(e) {
      const t = e.touches[0];
      if (!t) return;
      const rect = pacmanCanvas.getBoundingClientRect();
      touchStartX = t.clientX - rect.left;
      touchStartY = t.clientY - rect.top;
      touchStartTime = Date.now();
      touchMoved = false;
      e.preventDefault();
    }

    function onPacTouchMove(e) {
      touchMoved = true;
      const t = e.touches[0];
      if (!t) return;
      const rect = pacmanCanvas.getBoundingClientRect();
      const moveX = (t.clientX - rect.left) - touchStartX;
      const moveY = (t.clientY - rect.top) - touchStartY;

      // threshold for direction change
      const threshold = 20;
      if (Math.abs(moveX) > Math.abs(moveY)) {
        if (moveX > threshold) pac.nextDir = { x: 1, y: 0 };
        else if (moveX < -threshold) pac.nextDir = { x: -1, y: 0 };
      } else {
        if (moveY > threshold) pac.nextDir = { x: 0, y: 1 };
        else if (moveY < -threshold) pac.nextDir = { x: 0, y: -1 };
      }
      e.preventDefault();
    }

    function onPacTouchEnd(e) {
      const elapsed = Date.now() - touchStartTime;
      // treat as tap if short and not moved much
      if (!touchMoved && elapsed < 250) {
        if (!pacmanRunning) startPacman(); else pausePacman();
      }
      e.preventDefault();
    }

    pacmanCanvas.addEventListener('touchstart', onPacTouchStart, { passive: false });
    pacmanCanvas.addEventListener('touchmove', onPacTouchMove, { passive: false });
    pacmanCanvas.addEventListener('touchend', onPacTouchEnd, { passive: false });

    // scale canvas for devicePixelRatio so tiles are crisp on retina
    const dpr = window.devicePixelRatio || 1;
    pacmanCanvas.width = cols * tileSize * dpr;
    pacmanCanvas.height = rows * tileSize * dpr;
    pacmanCanvas.style.width = (cols * tileSize) + 'px';
    pacmanCanvas.style.height = (rows * tileSize) + 'px';
    pacmanCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    resetPacman();
    drawPacman();

    // Create a dedicated Pac-Man overlay similar to snake overlay
    let existingPacOverlay = document.getElementById('pacman-lose-overlay');
    if (!existingPacOverlay) {
      const overlay = document.createElement('div');
      overlay.id = 'pacman-lose-overlay';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.className = '';

      const inner = document.createElement('div');
      inner.className = 'panel';

      const title = document.createElement('div');
      title.id = 'pacman-lose-title';
      title.className = 'title';
      title.textContent = 'You Lost!';

      const reason = document.createElement('div');
      reason.id = 'pacman-lose-reason';
      reason.className = 'reason';

      const btn = document.createElement('button');
      btn.id = 'pacman-restart-btn';
      btn.className = 'restart-btn';
      btn.textContent = 'Restart';
      btn.addEventListener('click', () => {
        overlay.classList.remove('show');
        resetPacman();
        startPacman();
      });

      inner.appendChild(title);
      inner.appendChild(reason);
      inner.appendChild(btn);
      overlay.appendChild(inner);
      const container = pacmanCanvas.parentElement || document.body;
      container.style.position = container.style.position || 'relative';
      container.appendChild(overlay);

      function positionOverlay() {
        const rect = pacmanCanvas.getBoundingClientRect();
        const contRect = container.getBoundingClientRect();
        overlay.style.left = (rect.left - contRect.left) + 'px';
        overlay.style.top = (rect.top - contRect.top) + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
      }
      positionOverlay();
      window.addEventListener('resize', positionOverlay);
      overlay._positionOverlay = positionOverlay;
    }
    // Wire D-pad buttons if present
    const dpadUp = document.getElementById('dpad-up');
    const dpadDown = document.getElementById('dpad-down');
    const dpadLeft = document.getElementById('dpad-left');
    const dpadRight = document.getElementById('dpad-right');

    function attachDpad(btn, dir) {
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => { pac.nextDir = dir; e.preventDefault(); }, { passive: false });
      btn.addEventListener('mousedown', (e) => { pac.nextDir = dir; e.preventDefault(); });
    }

    attachDpad(dpadUp, {x:0,y:-1});
    attachDpad(dpadDown, {x:0,y:1});
    attachDpad(dpadLeft, {x:-1,y:0});
    attachDpad(dpadRight, {x:1,y:0});
  }

  /**
   * Initialize the Pac-Man lite demo.
   * @public
   */
  App.features.initPacman = initPacman;

  function startPacman() {
    if (!pacmanRunning) {
      pacmanRunning = true; pacmanPaused = false;
  if (!pacmanLoop) pacmanLoop = setInterval(updatePacman, pacTickMs);
    ensurePacHasDirection();
  debug('PacMan startPacman: starting main loop', { pac, pellets: pellets.length });
    updatePacmanStatus('Game Running');
  startGhostController();
    }
  }

  // ensure there's a sensible default direction when starting
  // if player hasn't given an initial direction, head right
  function ensurePacHasDirection() {
    if ((!pac.dir || (pac.dir.x === 0 && pac.dir.y === 0)) && (!pac.nextDir || (pac.nextDir.x === 0 && pac.nextDir.y === 0))) {
      pac.nextDir = { x: 1, y: 0 };
    }
  }

  // expose utility helpers under App.utils for modular wrappers
  App.utils = App.utils || {};
  App.utils.ensurePacHasDirection = ensurePacHasDirection;

  function pausePacman() {
    if (pacmanRunning) {
      pacmanPaused = !pacmanPaused;
  if (pacmanPaused) { clearInterval(pacmanLoop); pacmanLoop = null; updatePacmanStatus('Game Paused'); }
  else { pacmanLoop = setInterval(updatePacman, pacTickMs); updatePacmanStatus('Game Running'); }
    }
  }

  function resetPacman() {
    pacmanRunning = false; pacmanPaused = false;
    if (pacmanLoop) { clearInterval(pacmanLoop); pacmanLoop = null; }
    buildMaze();
  pac.x = 1; pac.y = 1; pac.dir = {x:0,y:0}; pac.nextDir={x:0,y:0};
  // reset ghosts to defaults
  ghosts[0].x = cols - 2; ghosts[0].y = rows - 2;
  ghosts[1].x = cols - 3; ghosts[1].y = rows - 2;
  ghosts[2].x = cols - 2; ghosts[2].y = rows - 3;
    pacmanState.score = 0; pacmanState.lives = 3;
    updatePacmanDisplay();
  // ensure a sensible starting direction is available after reset
  ensurePacHasDirection();
  updatePacmanStatus('Press SPACE to start');
    drawPacman();
  stopGhostController();
  }



  function updatePacman() {
  if (!pacmanRunning || pacmanPaused) return;
  debug('PacMan tick', { pac, pellets: pellets.length, ghosts: ghosts.map(g=>({x:g.x,y:g.y})) });
    // attempt to turn if nextDir is available
    const nx = pac.x + pac.nextDir.x;
    const ny = pac.y + pac.nextDir.y;
    if (canMoveTo(nx, ny)) pac.dir = { ...pac.nextDir };

    const tx = pac.x + pac.dir.x;
    const ty = pac.y + pac.dir.y;
    if (canMoveTo(tx, ty)) {
      pac.x = tx; pac.y = ty;
    }

    // collect pellet if present
    for (let i = pellets.length -1; i >= 0; i--) {
      const p = pellets[i];
      if (p.x === pac.x && p.y === pac.y) {
        pacmanState.score += p.power ? 50 : 10;
        pellets.splice(i,1);
      }
    }

    // collision with any ghost
    for (let gi = 0; gi < ghosts.length; gi++) {
      const g = ghosts[gi];
      if (g.x === pac.x && g.y === pac.y) {
        pacmanState.lives--;
        if (pacmanState.lives <= 0) {
          pacLose('Captured by ghost');
          return;
        } else {
          // reset positions (pacman and ghosts)
          pac.x = 1; pac.y = 1; pac.dir = {x:0,y:0}; pac.nextDir={x:0,y:0};
          ghosts[0].x = cols - 2; ghosts[0].y = rows - 2;
          ghosts[1].x = cols - 3; ghosts[1].y = rows - 2;
          ghosts[2].x = cols - 2; ghosts[2].y = rows - 3;
          break;
        }
      }
    }

    // win condition: all pellets collected
    if (pellets.length === 0) {
      pacmanWin();
      return;
    }

    updatePacmanDisplay();
    drawPacman();
  }

  function canMoveTo(x,y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return false;
    return maze[y][x] === 0;
  }

  function randomGhostMove(g) {
    const options = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
    // shuffle
    for (let i = options.length-1;i>0;i--) { const j = Math.floor(Math.random()*(i+1)); [options[i],options[j]]=[options[j],options[i]]; }
    for (const o of options) {
      if (canMoveTo(g.x+o.x, g.y+o.y)) return o;
    }
    return null;
  }

  // ===== A* pathfinding (grid-based) =====
  function aStarPath(startX, startY, goalX, goalY) {
    const inBounds = (x,y) => x >= 0 && x < cols && y >= 0 && y < rows;
    const key = (x,y) => `${x},${y}`;
    const open = new Map(); // key -> fScore
    const cameFrom = new Map();
    const gScore = new Map();

    function h(x,y) { return Math.abs(x - goalX) + Math.abs(y - goalY); } // Manhattan

    const startKey = key(startX,startY);
    open.set(startKey, h(startX,startY));
    gScore.set(startKey, 0);

    while (open.size > 0) {
      // pick node in open with lowest f = g + h
      let currentKey = null; let currentF = Infinity;
      for (const [k,f] of open.entries()) {
        if (f < currentF) { currentF = f; currentKey = k; }
      }
      const [cx, cy] = currentKey.split(',').map(Number);

      if (cx === goalX && cy === goalY) {
        // reconstruct path
        const path = [];
        let k = currentKey;
        while (cameFrom.has(k)) {
          const prev = cameFrom.get(k);
          const [px,py] = k.split(',').map(Number);
          path.push({ x: px, y: py });
          k = `${prev.x},${prev.y}`;
        }
        path.reverse();
        return path;
      }

      open.delete(currentKey);

      const neighbors = [{x:cx+1,y:cy},{x:cx-1,y:cy},{x:cx,y:cy+1},{x:cx,y:cy-1}];
      for (const n of neighbors) {
        if (!inBounds(n.x,n.y)) continue;
        if (!canMoveTo(n.x,n.y)) continue;
        const nk = key(n.x,n.y);
        const tentativeG = gScore.get(currentKey) + 1;
        if (tentativeG < (gScore.get(nk) || Infinity)) {
          cameFrom.set(nk, { x: cx, y: cy });
          gScore.set(nk, tentativeG);
          open.set(nk, tentativeG + h(n.x,n.y));
        }
      }
    }
    return null;
  }

  // Ghost controller: runs at a tuned interval to compute path and step along it
  let ghostPath = [];
  let ghostStepInterval = 300; // ms per ghost step (tune for difficulty)
  let ghostIntervalId = null;

  function startGhostController() {
    // create per-ghost intervals (staggered)
    stopGhostController();
    ghosts.forEach((g, idx) => {
      const interval = Math.max(140, ghostBaseInterval - idx * 40); // stagger speed by index
  debug('PacMan startGhostController: creating interval for ghost', idx, interval);
      const id = setInterval(() => {
        if (!pacmanRunning) return;
        // compute path using A*
        const path = aStarPath(g.x, g.y, pac.x, pac.y);
        if (path && path.length > 0) {
          const next = path[0];
          g.x = next.x; g.y = next.y;
        } else {
          const step = randomGhostMove(g);
          if (step) { g.x += step.x; g.y += step.y; }
        }
  debug('PacMan ghost moved', idx, { x: g.x, y: g.y });
      }, interval);
      // store id on ghost for cleanup
      g._intervalId = id;
    });
  }

  function stopGhostController() {
    ghosts.forEach(g => {
      if (g._intervalId) { clearInterval(g._intervalId); delete g._intervalId; }
    });
  }


  function pacLose(reason) {
    pacmanRunning = false;
    if (pacmanLoop) { clearInterval(pacmanLoop); pacmanLoop = null; }
  stopGhostController();
    const status = document.getElementById('pacman-game-status');
    if (status) status.textContent = `You lost: ${reason}`;
    const overlay = document.getElementById('pacman-lose-overlay');
    if (overlay) {
      const title = document.getElementById('pacman-lose-title');
      const reasonEl = document.getElementById('pacman-lose-reason');
      if (title) title.textContent = 'Pac-Man Lost!';
      if (reasonEl) reasonEl.textContent = reason;
      overlay.classList.add('show');
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      const btn = document.getElementById('pacman-restart-btn');
      if (btn) btn.focus();
    }
  }

  function pacmanWin() {
    pacmanRunning = false;
    if (pacmanLoop) { clearInterval(pacmanLoop); pacmanLoop = null; }
    const status = document.getElementById('pacman-game-status');
    if (status) status.textContent = 'You cleared the maze!';
  }

  function drawPacman() {
    if (!pacmanCtx) return;
    // clear
    pacmanCtx.fillStyle = 'rgba(0,0,0,0.95)';
    pacmanCtx.fillRect(0,0,pacmanCanvas.width,pacmanCanvas.height);

    // draw maze walls
    pacmanCtx.fillStyle = '#204080';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (maze[r][c] === 1) {
          pacmanCtx.fillRect(c*tileSize, r*tileSize, tileSize, tileSize);
        }
      }
    }

    // draw pellets
    pacmanCtx.fillStyle = '#ffd86b';
    pellets.forEach(p => {
      const size = p.power ? 6 : 3;
      pacmanCtx.beginPath();
      pacmanCtx.arc(p.x*tileSize + tileSize/2, p.y*tileSize + tileSize/2, size, 0, Math.PI*2);
      pacmanCtx.fill();
    });

    // draw pac
    pacmanCtx.fillStyle = '#ffd86b';
    pacmanCtx.beginPath();
    pacmanCtx.arc(pac.x*tileSize + tileSize/2, pac.y*tileSize + tileSize/2, tileSize/2 -2, 0, Math.PI*2);
    pacmanCtx.fill();

    // draw ghosts
    ghosts.forEach(g => {
      pacmanCtx.fillStyle = g.color || '#ff6b6b';
      pacmanCtx.fillRect(g.x*tileSize+2, g.y*tileSize+4, tileSize-4, tileSize-6);
    });

    updateConfetti(); // ensure confetti (from snake) doesn't conflict, lightweight
  }

  function updatePacmanDisplay() {
    document.getElementById('pacman-score').textContent = pacmanState.score;
    document.getElementById('pacman-lives').textContent = pacmanState.lives;
  }

  function updatePacmanStatus(message) {
    const statusEl = document.getElementById('pacman-game-status');
    if (statusEl) statusEl.textContent = message;
  }

  // Initialize Pac-Man if canvas exists
  if (document.getElementById('pacmanCanvas')) {
  initPacman();
  debug('Pac-Man initialized');
  }

  // Auto-initialize any feature modules when their DOM elements are present.
  // This guards against module load order differences between the legacy script and ESM feature modules.
  function autoInitFeatures() {
    const registry = window.App && window.App.features ? window.App.features : App.features || {};
    const attempts = [
      { id: 'pacmanCanvas', fn: registry.initPacman || registry.initPacmanGame || registry.initPacman || initPacman },
      { id: 'snakeCanvas', fn: registry.initSnakeGame || initSnakeGame },
      { id: 'pingpongCanvas', fn: registry.initPingPongGame || initPingPongGame },
      { id: 'matrixCanvas', fn: registry.initMatrixRain || initMatrixRain },
      { id: 'neuralCanvas', fn: registry.initNeuralNetwork || initNeuralNetwork },
      { id: 'particlesCanvas', fn: registry.initParticleSystem || initParticleSystem }
    ];

    attempts.forEach(a => {
      if (document.getElementById(a.id) && typeof a.fn === 'function') {
        try {
          a.fn();
          debug('autoInitFeatures: initialized', a.id);
        } catch (e) {
          console.warn('autoInitFeatures: failed to init', a.id, e);
        }
      }
    });
  }

  // Run auto-init once after DOM load. Modules that register later may still attempt to auto-init themselves on import.
    autoInitFeatures();
  }

  // If document already loaded, run immediately; otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _mainDOMContentLoaded);
  } else {
    _mainDOMContentLoaded();
  }