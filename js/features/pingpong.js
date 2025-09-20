// Ping-Pong game module (extracted from legacy script.js)
let pingpongCanvas, pingpongCtx;
let pingpongGameRunning = false;
let pingpongGamePaused = false;
let pingpongGameLoop;
let ball = { x: 300, y: 200, dx: 5, dy: 3, radius: 8, speed: 5, acceleration: 0, maxSpeed: 12 };
let playerPaddle = { x: 50, y: 150, width: 15, height: 80, speed: 12 };
let aiPaddle = { x: 535, y: 150, width: 15, height: 80, speed: 7 };
let aiReactionTime = 80; let aiLastReact = 0; let aiTargetY = aiPaddle.y + aiPaddle.height / 2;
function predictBallYAtX(targetX) { if (!pingpongCanvas) return ball.y; if (ball.dx === 0) return ball.y; const h = pingpongCanvas.height; const time = (targetX - ball.x) / ball.dx; if (time <= 0) return ball.y; let predY = ball.y + ball.dy * time; const period = 2 * h; predY = ((predY % period) + period) % period; if (predY > h) predY = period - predY; return predY; }
let pingPongScores = { player: 0, ai: 0 }; let rallyCount = 0; let touchControlEnabled = false; let playerMoveUp = false; let playerMoveDown = false;

function initPingPongGame() {
  pingpongCanvas = document.getElementById('pingpongCanvas'); if (!pingpongCanvas) return; pingpongCtx = pingpongCanvas.getContext('2d');
  document.getElementById('startPingpongBtn')?.addEventListener('click', startPingPongGame);
  document.getElementById('pausePingpongBtn')?.addEventListener('click', pausePingPongGame);
  document.getElementById('resetPingpongBtn')?.addEventListener('click', resetPingPongGame);
  document.addEventListener('keydown', (e) => { handlePingPongKeyPress(e, true); });
  document.addEventListener('keyup', (e) => { handlePingPongKeyPress(e, false); });
  const difficultySelect = document.getElementById('ping-difficulty');
  const difficultyPresets = { Easy: { aiReactionTime: 220, aiSpeed: 4 }, Medium: { aiReactionTime: 80, aiSpeed: 7 }, Hard: { aiReactionTime: 40, aiSpeed: 10 } };
  function applyDifficulty(name) { const p = difficultyPresets[name] || difficultyPresets.Medium; aiReactionTime = p.aiReactionTime; aiPaddle.speed = p.aiSpeed; }
  const stored = localStorage.getItem('pingDifficulty'); const initial = stored || 'Medium'; applyDifficulty(initial);
  if (difficultySelect) { difficultySelect.value = initial; difficultySelect.addEventListener('change', (e) => { const v = e.target.value; applyDifficulty(v); localStorage.setItem('pingDifficulty', v); const di = document.getElementById('difficulty-indicator'); if (di) di.textContent = v; }); const di = document.getElementById('difficulty-indicator'); if (di) di.textContent = initial; }
  let dragging = false; let mouseMoveHandler = (e) => { if (!dragging) return; const rect = pingpongCanvas.getBoundingClientRect(); const y = e.clientY - rect.top; playerPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - playerPaddle.height, y - playerPaddle.height / 2)); updatePingPongDisplay(); drawPingPongGame(); };
  let touchMoveHandler = (e) => { if (!touchControlEnabled) return; const rect = pingpongCanvas.getBoundingClientRect(); const touch = e.touches[0]; if (!touch) return; const y = touch.clientY - rect.top; playerPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - playerPaddle.height, y - playerPaddle.height / 2)); updatePingPongDisplay(); drawPingPongGame(); e.preventDefault(); };
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0); touchControlEnabled = !!isTouchDevice;
  if (isTouchDevice) { const pingBadge = document.getElementById('ping-touch-indicator'); if (pingBadge) { pingBadge.style.display = 'inline-flex'; pingBadge.setAttribute('aria-hidden', 'false'); } pingpongCanvas.addEventListener('touchmove', touchMoveHandler, { passive: false }); pingpongCanvas.addEventListener('touchstart', (e) => { touchMoveHandler(e); }, { passive: false }); }
  function onMouseDown(e) { if (!touchControlEnabled && !isTouchDevice) return; dragging = true; mouseMoveHandler(e); }
  function onMouseUp() { dragging = false; }
  pingpongCanvas.addEventListener('mousedown', onMouseDown); pingpongCanvas.addEventListener('mouseup', onMouseUp); pingpongCanvas.addEventListener('mouseleave', onMouseUp);
  drawPingPongGame();
}

function startPingPongGame() { if (!pingpongGameRunning && !pingpongGamePaused) { ball.x = pingpongCanvas.width / 2; ball.y = pingpongCanvas.height / 2; ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1); ball.dy = (Math.random() - 0.5) * 4; } pingpongGameRunning = true; pingpongGamePaused = false; updatePingPongGameStatus('Game Running'); if (!pingpongGameLoop) pingpongGameLoop = setInterval(updatePingPongGame, 16); }

function pausePingPongGame() { if (pingpongGameRunning) { pingpongGamePaused = !pingpongGamePaused; updatePingPongGameStatus(pingpongGamePaused ? 'Game Paused' : 'Game Running'); if (pingpongGamePaused) { clearInterval(pingpongGameLoop); pingpongGameLoop = null; } else { pingpongGameLoop = setInterval(updatePingPongGame, 16); } } }

function resetPingPongGame() { pingPongScores.player = 0; pingPongScores.ai = 0; pingpongGameRunning = false; pingpongGamePaused = false; if (pingpongGameLoop) { clearInterval(pingpongGameLoop); pingpongGameLoop = null; } ball.x = pingpongCanvas.width / 2; ball.y = pingpongCanvas.height / 2; ball.dx = 0; ball.dy = 0; playerPaddle.y = (pingpongCanvas.height - playerPaddle.height) / 2; aiPaddle.y = (pingpongCanvas.height - aiPaddle.height) / 2; updatePingPongDisplay(); updatePingPongGameStatus('Press SPACE or click Start to begin'); drawPingPongGame(); }

function updatePingPongGame() { if (!pingpongGameRunning || pingpongGamePaused) return; ball.x += ball.dx; ball.y += ball.dy; if (ball.y <= ball.radius || ball.y >= pingpongCanvas.height - ball.radius) ball.dy = -ball.dy; if (ball.x <= playerPaddle.x + playerPaddle.width && ball.x >= playerPaddle.x && ball.y >= playerPaddle.y && ball.y <= playerPaddle.y + playerPaddle.height) { ball.dx = Math.abs(ball.dx); ball.dy += (ball.y - (playerPaddle.y + playerPaddle.height / 2)) * 0.1; ball.acceleration = Math.min((ball.acceleration || 0) + 0.4, ball.maxSpeed - ball.speed); ball.speed = Math.min(ball.speed + ball.acceleration, ball.maxSpeed); ball.dx = Math.sign(ball.dx) * Math.abs(ball.speed); ball.dy = ball.dy * 1.1; } if (ball.x >= aiPaddle.x - ball.radius && ball.x <= aiPaddle.x + aiPaddle.width && ball.y >= aiPaddle.y && ball.y <= aiPaddle.y + aiPaddle.height) { ball.dx = -Math.abs(ball.dx); ball.dy += (ball.y - (aiPaddle.y + aiPaddle.height / 2)) * 0.1; ball.acceleration = Math.min((ball.acceleration || 0) + 0.4, ball.maxSpeed - ball.speed); ball.speed = Math.min(ball.speed + ball.acceleration, ball.maxSpeed); ball.dx = -Math.abs(ball.speed); ball.dy = ball.dy * 1.1; } if (ball.x < 0) { pingPongScores.ai++; rallyCount++; resetBall(); } else if (ball.x > pingpongCanvas.width) { pingPongScores.player++; rallyCount++; resetBall(); } if (!touchControlEnabled) { if (playerMoveUp) playerPaddle.y = Math.max(0, playerPaddle.y - playerPaddle.speed); if (playerMoveDown) playerPaddle.y = Math.min(pingpongCanvas.height - playerPaddle.height, playerPaddle.y + playerPaddle.speed); } const now = Date.now(); if (now - aiLastReact > aiReactionTime) { aiLastReact = now; const targetX = aiPaddle.x; aiTargetY = predictBallYAtX(targetX); } const aiCenter = aiPaddle.y + aiPaddle.height / 2; const delta = aiTargetY - aiCenter; const step = Math.sign(delta) * Math.min(Math.abs(delta), aiPaddle.speed + Math.min(3, Math.floor(ball.speed / 2))); aiPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - aiPaddle.height, aiPaddle.y + step)); aiPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - aiPaddle.height, aiPaddle.y)); updatePingPongDisplay(); drawPingPongGame(); }

function resetBall() { ball.x = pingpongCanvas.width / 2; ball.y = pingpongCanvas.height / 2; ball.speed = 5; ball.acceleration = 0; ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1); ball.dy = (Math.random() - 0.5) * 4; }

function drawPingPongGame() { if (!pingpongCtx) return; pingpongCtx.fillStyle = 'rgba(0, 0, 0, 0.9)'; pingpongCtx.fillRect(0, 0, pingpongCanvas.width, pingpongCanvas.height); pingpongCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; pingpongCtx.lineWidth = 2; pingpongCtx.setLineDash([10, 10]); pingpongCtx.beginPath(); pingpongCtx.moveTo(pingpongCanvas.width / 2, 0); pingpongCtx.lineTo(pingpongCanvas.width / 2, pingpongCanvas.height); pingpongCtx.stroke(); pingpongCtx.setLineDash([]); pingpongCtx.fillStyle = '#00d4ff'; pingpongCtx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height); pingpongCtx.fillStyle = '#ff00ff'; pingpongCtx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height); pingpongCtx.fillStyle = '#00ff88'; pingpongCtx.beginPath(); pingpongCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); pingpongCtx.fill(); pingpongCtx.fillStyle = 'rgba(0, 255, 136, 0.3)'; pingpongCtx.beginPath(); pingpongCtx.arc(ball.x - ball.dx, ball.y - ball.dy, ball.radius * 0.7, 0, Math.PI * 2); pingpongCtx.fill(); }

function handlePingPongKeyPress(e, isDown) { if (isDown && e.code === 'Space') { e.preventDefault(); if (!pingpongGameRunning) startPingPongGame(); else if (pingpongGameRunning) pausePingPongGame(); return; } if (!pingpongGameRunning || pingpongGamePaused) return; if (e.code === 'ArrowUp') { playerMoveUp = !!isDown; if (isDown && !touchControlEnabled) playerPaddle.y = Math.max(0, playerPaddle.y - Math.round(playerPaddle.speed * 1.8)); e.preventDefault(); } if (e.code === 'KeyW') { playerMoveUp = !!isDown; if (isDown && !touchControlEnabled) playerPaddle.y = Math.max(0, playerPaddle.y - Math.round(playerPaddle.speed * 2)); e.preventDefault(); } if (e.code === 'ArrowDown' || e.code === 'KeyS') { playerMoveDown = !!isDown; e.preventDefault(); } }

function updatePingPongDisplay() { document.getElementById('player-score').textContent = pingPongScores.player; document.getElementById('ai-score').textContent = pingPongScores.ai; const rc = document.getElementById('rally-count'); if (rc) rc.textContent = rallyCount; const di = document.getElementById('difficulty-indicator'); if (di) di.textContent = (localStorage.getItem('pingDifficulty') || 'Medium'); }

function updatePingPongGameStatus(message) { const statusEl = document.getElementById('pingpong-game-status'); if (statusEl) statusEl.textContent = message; }

if (typeof window !== 'undefined') {
  window.App = window.App || {};
  window.App.features = window.App.features || {};
  window.App.features.initPingPongGame = window.App.features.initPingPongGame || initPingPongGame;
  window.App.debug && window.App.debug('pingpong module loaded. initPingPongGame registered');
}

export { initPingPongGame };
