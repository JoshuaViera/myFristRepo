// Snake game module (extracted from legacy script.js)
// Registers initSnakeGame on App.features and auto-inits if canvas present.

let snakeCanvas, snakeCtx;
let snake = [];
let food = {};
let snakeLost = false;
let snakeLoseReason = '';
let confettiParticles = [];
let confettiActive = false;
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let gameRunning = false;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = 200;
let gameLoop;
let currentSpeed = 'slow';

function initSnakeGame() {
  snakeCanvas = document.getElementById('snakeCanvas');
  if (!snakeCanvas) return;
  snakeCtx = snakeCanvas.getContext('2d');
  resetSnakeGame();
  document.getElementById('startSnakeBtn')?.addEventListener('click', startSnakeGame);
  document.getElementById('pauseSnakeBtn')?.addEventListener('click', pauseSnakeGame);
  document.getElementById('resetSnakeBtn')?.addEventListener('click', resetSnakeGame);
  document.querySelectorAll('.speed-btn').forEach(btn => btn.addEventListener('click', changeGameSpeed));
  document.addEventListener('keydown', handleSnakeKeyPress);

  let touchStartX = null;
  let touchStartY = null;

  function onSnakeTouchStart(e) {
    const t = e.touches[0]; if (!t) return;
    const rect = snakeCanvas.getBoundingClientRect();
    touchStartX = t.clientX - rect.left; touchStartY = t.clientY - rect.top; e.preventDefault();
  }

  function onSnakeTouchMove(e) {
    if (!touchStartX || !touchStartY) return; const t = e.touches[0]; if (!t) return; const rect = snakeCanvas.getBoundingClientRect();
    const moveX = (t.clientX - rect.left) - touchStartX; const moveY = (t.clientY - rect.top) - touchStartY;
    if (Math.abs(moveX) > Math.abs(moveY)) { if (moveX > 20) { if (direction.x === 0) nextDirection = { x: 1, y: 0 }; } else if (moveX < -20) { if (direction.x === 0) nextDirection = { x: -1, y: 0 }; } }
    else { if (moveY > 20) { if (direction.y === 0) nextDirection = { x: 0, y: 1 }; } else if (moveY < -20) { if (direction.y === 0) nextDirection = { x: 0, y: -1 }; } }
    e.preventDefault();
  }

  snakeCanvas.addEventListener('touchstart', onSnakeTouchStart, { passive: false });
  snakeCanvas.addEventListener('touchmove', onSnakeTouchMove, { passive: false });
  document.getElementById('snake-high-score').textContent = highScore;
  if (('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) {
    const snakeBadge = document.getElementById('snake-touch-indicator'); if (snakeBadge) { snakeBadge.style.display = 'inline-flex'; snakeBadge.setAttribute('aria-hidden', 'false'); }
  }

  let existingOverlay = document.getElementById('snake-lose-overlay');
  if (!existingOverlay) {
    const overlay = document.createElement('div'); overlay.id = 'snake-lose-overlay'; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.className = '';
    const inner = document.createElement('div'); inner.className = 'panel';
    const title = document.createElement('div'); title.id = 'snake-lose-title'; title.className = 'title'; title.textContent = 'You Lost!';
    const reason = document.createElement('div'); reason.id = 'snake-lose-reason'; reason.className = 'reason';
    const btn = document.createElement('button'); btn.id = 'snake-restart-btn'; btn.className = 'restart-btn'; btn.textContent = 'Restart';
    btn.addEventListener('click', () => { overlay.classList.remove('show'); confettiActive = false; confettiParticles = []; resetSnakeGame(); startSnakeGame(); });
    inner.appendChild(title); inner.appendChild(reason); inner.appendChild(btn); overlay.appendChild(inner);
    const container = snakeCanvas.parentElement || document.body; container.style.position = container.style.position || 'relative'; container.appendChild(overlay);
    function positionOverlay() { const rect = snakeCanvas.getBoundingClientRect(); const contRect = container.getBoundingClientRect(); overlay.style.left = (rect.left - contRect.left) + 'px'; overlay.style.top = (rect.top - contRect.top) + 'px'; overlay.style.width = rect.width + 'px'; overlay.style.height = rect.height + 'px'; }
    positionOverlay(); window.addEventListener('resize', positionOverlay); overlay._positionOverlay = positionOverlay;
  }

  drawSnakeGame();
}

function resetSnakeGame() { snake = [{ x: 10, y: 10 }]; direction = { x: 0, y: 0 }; nextDirection = { x: 0, y: 0 }; score = 0; snakeLost = false; snakeLoseReason = ''; const overlay = document.getElementById('snake-lose-overlay'); if (overlay) overlay.style.display = 'none'; confettiActive = false; confettiParticles = []; gameRunning = false; gamePaused = false; if (gameLoop) { clearInterval(gameLoop); gameLoop = null; } generateFood(); updateSnakeDisplay(); updateSnakeGameStatus('Press SPACE or click Start to begin'); drawSnakeGame(); }

function startSnakeGame() { if (!gameRunning && !gamePaused) { direction = { x: 1, y: 0 }; nextDirection = { x: 1, y: 0 }; } gameRunning = true; gamePaused = false; updateSnakeGameStatus('Game Running'); if (!gameLoop) gameLoop = setInterval(gameUpdate, gameSpeed); }

function changeGameSpeed(event) { const button = event.target; const speed = parseInt(button.dataset.speed); document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active')); button.classList.add('active'); gameSpeed = speed; if (speed === 200) currentSpeed = 'slow'; else if (speed === 150) currentSpeed = 'normal'; else if (speed === 100) currentSpeed = 'fast'; if (gameRunning && !gamePaused) { if (gameLoop) clearInterval(gameLoop); gameLoop = setInterval(gameUpdate, gameSpeed); } }

function pauseSnakeGame() { if (gameRunning) { gamePaused = !gamePaused; updateSnakeGameStatus(gamePaused ? 'Game Paused' : 'Game Running'); if (gamePaused) { clearInterval(gameLoop); gameLoop = null; } else { gameLoop = setInterval(gameUpdate, gameSpeed); } } }

function generateFood() { const gridSize = 20; const canvasWidth = snakeCanvas.width / gridSize; const canvasHeight = snakeCanvas.height / gridSize; let attempts = 0; do { food = { x: Math.floor(Math.random() * canvasWidth), y: Math.floor(Math.random() * canvasHeight) }; attempts++; if (attempts > 200) break; } while ((food.x === 10 && food.y === 10) || snake.some(segment => segment.x === food.x && segment.y === food.y)); }

function gameUpdate() { if (snakeLost) { drawSnakeGame(); return; } if (!gameRunning || gamePaused) return; direction = { ...nextDirection }; const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }; if (head.x < 0 || head.x >= snakeCanvas.width / 20 || head.y < 0 || head.y >= snakeCanvas.height / 20) { snakeLost = true; snakeLoseReason = 'Crashed into a wall'; gameOver(); return; } if (snake.some(segment => segment.x === head.x && segment.y === head.y)) { snakeLost = true; snakeLoseReason = 'Head to body collision'; gameOver(); return; } snake.unshift(head); if (head.x === food.x && head.y === food.y) { score += 10; generateFood(); updateSnakeDisplay(); } else { snake.pop(); } drawSnakeGame(); }

function gameOver() { gameRunning = false; gamePaused = false; if (gameLoop) { clearInterval(gameLoop); gameLoop = null; } if (score > highScore) { highScore = score; localStorage.setItem('snakeHighScore', highScore); document.getElementById('snake-high-score').textContent = highScore; } updateSnakeGameStatus(`You lost: ${snakeLoseReason} — Final Score: ${score}`); snake = [{ x: 10, y: 10 }]; direction = { x: 0, y: 0 }; nextDirection = { x: 0, y: 0 }; generateFood(); updateSnakeDisplay(); drawSnakeGame(); const overlay = document.getElementById('snake-lose-overlay'); if (overlay) { const title = document.getElementById('snake-lose-title'); const reasonEl = document.getElementById('snake-lose-reason'); if (title) title.textContent = 'You Lost!'; if (reasonEl) reasonEl.textContent = snakeLoseReason; overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.pointerEvents = 'auto'; const btn = document.getElementById('snake-restart-btn'); if (btn) btn.focus(); } createConfetti(); }

function createConfetti() { confettiParticles = []; const colors = ['#ff4d4d','#ffd86b','#6bffb8','#6bd1ff','#c86bff']; const count = 60; for (let i = 0; i < count; i++) { confettiParticles.push({ x: Math.random() * snakeCanvas.width, y: Math.random() * (snakeCanvas.height * 0.3), dx: (Math.random() - 0.5) * 2, dy: Math.random() * 3 + 2, size: Math.random() * 6 + 4, color: colors[Math.floor(Math.random() * colors.length)], rot: Math.random() * Math.PI, life: Math.random() * 60 + 60 }); } confettiActive = true; }

function updateConfetti() { if (!confettiActive || !confettiParticles.length) return; for (let i = confettiParticles.length - 1; i >= 0; i--) { const p = confettiParticles[i]; p.x += p.dx; p.y += p.dy; p.rot += 0.1; p.dy += 0.05; p.life--; if (p.life <= 0 || p.y > snakeCanvas.height + 20) confettiParticles.splice(i, 1); } if (confettiParticles.length === 0) confettiActive = false; }

function drawSnakeGame() { if (!snakeCtx) return; snakeCtx.fillStyle = 'rgba(0, 0, 0, 0.9)'; snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height); snakeCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; snakeCtx.lineWidth = 1; for (let x = 0; x < snakeCanvas.width; x += 20) { snakeCtx.beginPath(); snakeCtx.moveTo(x, 0); snakeCtx.lineTo(x, snakeCanvas.height); snakeCtx.stroke(); } for (let y = 0; y < snakeCanvas.height; y += 20) { snakeCtx.beginPath(); snakeCtx.moveTo(0, y); snakeCtx.lineTo(snakeCanvas.width, y); snakeCtx.stroke(); } snake.forEach((segment, index) => { if (index === 0) { snakeCtx.fillStyle = gameRunning ? '#00ff88' : '#ff4444'; snakeCtx.fillRect(segment.x * 20 + 2, segment.y * 20 + 2, 16, 16); snakeCtx.fillStyle = '#ffffff'; snakeCtx.fillRect(segment.x * 20 + 5, segment.y * 20 + 5, 3, 3); snakeCtx.fillRect(segment.x * 20 + 12, segment.y * 20 + 5, 3, 3); } else { const alpha = 1 - (index / snake.length) * 0.5; snakeCtx.fillStyle = `rgba(0, 255, 136, ${alpha})`; snakeCtx.fillRect(segment.x * 20 + 3, segment.y * 20 + 3, 14, 14); } }); snakeCtx.fillStyle = '#ff4444'; snakeCtx.beginPath(); snakeCtx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2); snakeCtx.fill(); snakeCtx.fillStyle = '#ff8888'; snakeCtx.beginPath(); snakeCtx.arc(food.x * 20 + 7, food.y * 20 + 7, 3, 0, Math.PI * 2); snakeCtx.fill(); if (confettiActive && confettiParticles.length) { confettiParticles.forEach(p => { snakeCtx.save(); snakeCtx.translate(p.x, p.y); snakeCtx.rotate(p.rot); snakeCtx.fillStyle = p.color; snakeCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6); snakeCtx.restore(); }); updateConfetti(); } if (snakeLost) { const cx = snakeCanvas.width / 2; const cy = snakeCanvas.height / 2; snakeCtx.fillStyle = 'rgba(0,0,0,0.6)'; snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height); const gradient = snakeCtx.createLinearGradient(cx - 150, cy - 60, cx + 150, cy + 60); gradient.addColorStop(0, '#ff4444'); gradient.addColorStop(0.5, '#ffdd44'); gradient.addColorStop(1, '#44ff88'); snakeCtx.font = 'bold 30px system-ui, -apple-system, Segoe UI, Roboto, Arial'; snakeCtx.textAlign = 'center'; snakeCtx.textBaseline = 'middle'; snakeCtx.fillStyle = gradient; snakeCtx.fillText('You Lost!', cx, cy - 20); snakeCtx.font = '18px system-ui, -apple-system, Segoe UI, Roboto, Arial'; snakeCtx.fillStyle = '#ffffff'; snakeCtx.fillText(snakeLoseReason, cx, cy + 10); snakeCtx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, Arial'; snakeCtx.fillStyle = 'rgba(255,255,255,0.9)'; snakeCtx.fillText('Press Reset or Space to play again', cx, cy + 40); } }

function handleSnakeKeyPress(e) { if (snakeLost && e.code === 'Space') { e.preventDefault(); resetSnakeGame(); startSnakeGame(); return; } if (!gameRunning && e.code === 'Space') { e.preventDefault(); startSnakeGame(); return; } if (gameRunning && e.code === 'Space') { e.preventDefault(); pauseSnakeGame(); return; } if (!gameRunning || gamePaused) return; switch(e.code) { case 'ArrowUp': case 'KeyW': if (direction.y === 0) nextDirection = { x: 0, y: -1 }; e.preventDefault(); break; case 'ArrowDown': case 'KeyS': if (direction.y === 0) nextDirection = { x: 0, y: 1 }; e.preventDefault(); break; case 'ArrowLeft': case 'KeyA': if (direction.x === 0) nextDirection = { x: -1, y: 0 }; e.preventDefault(); break; case 'ArrowRight': case 'KeyD': if (direction.x === 0) nextDirection = { x: 1, y: 0 }; e.preventDefault(); break; } }

function updateSnakeDisplay() { document.getElementById('snake-score').textContent = score; document.getElementById('snake-length').textContent = snake.length; }

function updateSnakeGameStatus(message) { const statusEl = document.getElementById('snake-game-status'); if (statusEl) statusEl.textContent = message; }

if (typeof window !== 'undefined') {
  window.App = window.App || {};
  window.App.features = window.App.features || {};
  window.App.features.initSnakeGame = window.App.features.initSnakeGame || initSnakeGame;
  // lightweight self-test log
  window.App.debug && window.App.debug('snake module loaded. initSnakeGame registered');
}

if (typeof document !== 'undefined' && document.getElementById('snakeCanvas')) {
  try { initSnakeGame(); window.App && window.App.debug && window.App.debug('snake auto-init: success'); } catch (e) { console.warn('snake auto-init failed', e); }
}

export { initSnakeGame };
