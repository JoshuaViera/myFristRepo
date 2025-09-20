// Pac-Man module (extracted from legacy script.js)
const tileSize = 18; const cols = 28; const rows = 20;
let pacmanCanvas, pacmanCtx; let pacmanRunning = false; let pacmanPaused = false; let pacmanLoop = null;
let maze = []; let pellets = [];
const pac = { x: 1, y: 1, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, speed: 1 };
let ghosts = [ { x: cols - 2, y: rows - 2, color: '#ff6b6b' }, { x: cols - 3, y: rows - 2, color: '#6bd1ff' }, { x: cols - 2, y: rows - 3, color: '#c86bff' } ];
let pacTickMs = 120; let ghostBaseInterval = 260; let pacmanState = { score: 0, lives: 3 };

function buildMaze() { maze = Array(rows).fill().map(() => Array(cols).fill(0)); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (r === 0 || r === rows -1 || c === 0 || c === cols -1) maze[r][c] = 1; for (let r = 2; r < rows -2; r+=4) for (let c = 2; c < cols -2; c++) if (c % 6 !== 0) maze[r][c] = 1; pellets = []; for (let r = 1; r < rows -1; r++) for (let c = 1; c < cols -1; c++) if (maze[r][c] === 0) pellets.push({ x: c, y: r, power: false }); for (let i = 0; i < 4; i++) { const idx = Math.floor(Math.random() * pellets.length); pellets[idx].power = true; } }

function initPacman() { pacmanCanvas = document.getElementById('pacmanCanvas'); if (!pacmanCanvas) return; pacmanCtx = pacmanCanvas.getContext('2d'); buildMaze(); pac.x = 1; pac.y = 1; pac.dir = {x:0,y:0}; pac.nextDir={x:0,y:0}; ghosts[0].x = cols - 2; ghosts[0].y = rows - 2; ghosts[1].x = cols - 3; ghosts[1].y = rows - 2; ghosts[2].x = cols - 2; ghosts[2].y = rows - 3; pacmanState.score = 0; pacmanState.lives = 3; document.getElementById('startPacmanBtn')?.addEventListener('click', startPacman); document.getElementById('pausePacmanBtn')?.addEventListener('click', pausePacman); document.getElementById('resetPacmanBtn')?.addEventListener('click', resetPacman); document.addEventListener('keydown', (e) => { switch(e.code) { case 'ArrowUp': pac.nextDir = {x:0,y:-1}; e.preventDefault(); break; case 'ArrowDown': pac.nextDir = {x:0,y:1}; e.preventDefault(); break; case 'ArrowLeft': pac.nextDir = {x:-1,y:0}; e.preventDefault(); break; case 'ArrowRight': pac.nextDir = {x:1,y:0}; e.preventDefault(); break; case 'Space': if (!pacmanRunning) startPacman(); else pausePacman(); e.preventDefault(); break; } });

  let touchStartX = 0, touchStartY = 0, touchStartTime = 0; let touchMoved = false;
  function onPacTouchStart(e) { const t = e.touches[0]; if (!t) return; const rect = pacmanCanvas.getBoundingClientRect(); touchStartX = t.clientX - rect.left; touchStartY = t.clientY - rect.top; touchStartTime = Date.now(); touchMoved = false; e.preventDefault(); }
  function onPacTouchMove(e) { touchMoved = true; const t = e.touches[0]; if (!t) return; const rect = pacmanCanvas.getBoundingClientRect(); const moveX = (t.clientX - rect.left) - touchStartX; const moveY = (t.clientY - rect.top) - touchStartY; const threshold = 20; if (Math.abs(moveX) > Math.abs(moveY)) { if (moveX > threshold) pac.nextDir = { x: 1, y: 0 }; else if (moveX < -threshold) pac.nextDir = { x: -1, y: 0 }; } else { if (moveY > threshold) pac.nextDir = { x: 0, y: 1 }; else if (moveY < -threshold) pac.nextDir = { x: 0, y: -1 }; } e.preventDefault(); }
  function onPacTouchEnd(e) { const elapsed = Date.now() - touchStartTime; if (!touchMoved && elapsed < 250) { if (!pacmanRunning) startPacman(); else pausePacman(); } e.preventDefault(); }
  pacmanCanvas.addEventListener('touchstart', onPacTouchStart, { passive: false }); pacmanCanvas.addEventListener('touchmove', onPacTouchMove, { passive: false }); pacmanCanvas.addEventListener('touchend', onPacTouchEnd, { passive: false });

  const dpr = window.devicePixelRatio || 1; pacmanCanvas.width = cols * tileSize * dpr; pacmanCanvas.height = rows * tileSize * dpr; pacmanCanvas.style.width = (cols * tileSize) + 'px'; pacmanCanvas.style.height = (rows * tileSize) + 'px'; pacmanCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  resetPacman(); drawPacman();
  let existingPacOverlay = document.getElementById('pacman-lose-overlay'); if (!existingPacOverlay) { const overlay = document.createElement('div'); overlay.id = 'pacman-lose-overlay'; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.className = ''; const inner = document.createElement('div'); inner.className = 'panel'; const title = document.createElement('div'); title.id = 'pacman-lose-title'; title.className = 'title'; title.textContent = 'You Lost!'; const reason = document.createElement('div'); reason.id = 'pacman-lose-reason'; reason.className = 'reason'; const btn = document.createElement('button'); btn.id = 'pacman-restart-btn'; btn.className = 'restart-btn'; btn.textContent = 'Restart'; btn.addEventListener('click', () => { overlay.classList.remove('show'); resetPacman(); startPacman(); }); inner.appendChild(title); inner.appendChild(reason); inner.appendChild(btn); overlay.appendChild(inner); const container = pacmanCanvas.parentElement || document.body; container.style.position = container.style.position || 'relative'; container.appendChild(overlay); function positionOverlay() { const rect = pacmanCanvas.getBoundingClientRect(); const contRect = container.getBoundingClientRect(); overlay.style.left = (rect.left - contRect.left) + 'px'; overlay.style.top = (rect.top - contRect.top) + 'px'; overlay.style.width = rect.width + 'px'; overlay.style.height = rect.height + 'px'; } positionOverlay(); window.addEventListener('resize', positionOverlay); overlay._positionOverlay = positionOverlay; }

  const dpadUp = document.getElementById('dpad-up'); const dpadDown = document.getElementById('dpad-down'); const dpadLeft = document.getElementById('dpad-left'); const dpadRight = document.getElementById('dpad-right');
  function attachDpad(btn, dir) { if (!btn) return; btn.addEventListener('touchstart', (e) => { pac.nextDir = dir; e.preventDefault(); }, { passive: false }); btn.addEventListener('mousedown', (e) => { pac.nextDir = dir; e.preventDefault(); }); }
  attachDpad(dpadUp, {x:0,y:-1}); attachDpad(dpadDown, {x:0,y:1}); attachDpad(dpadLeft, {x:-1,y:0}); attachDpad(dpadRight, {x:1,y:0}); }

function ensurePacHasDirection() {
  if ((!pac.dir || (pac.dir.x === 0 && pac.dir.y === 0)) && (!pac.nextDir || (pac.nextDir.x === 0 && pac.nextDir.y === 0))) {
    pac.nextDir = { x: 1, y: 0 };
  }
}

function startPacman() {
  if (!pacmanRunning) {
    pacmanRunning = true;
    pacmanPaused = false;
    if (!pacmanLoop) pacmanLoop = setInterval(updatePacman, pacTickMs);
    // prefer a global helper if present, otherwise use local
    if (typeof window !== 'undefined' && window.App && window.App.utils && typeof window.App.utils.ensurePacHasDirection === 'function') {
      window.App.utils.ensurePacHasDirection();
    } else {
      ensurePacHasDirection();
    }
    updatePacmanStatus('Game Running');
    startGhostController();
  }
}

// expose utility helper on App.utils for backward compatibility
if (typeof window !== 'undefined') {
  window.App = window.App || {};
  window.App.utils = window.App.utils || {};
  window.App.utils.ensurePacHasDirection = window.App.utils.ensurePacHasDirection || ensurePacHasDirection;
}

function pausePacman() { if (pacmanRunning) { pacmanPaused = !pacmanPaused; if (pacmanPaused) { clearInterval(pacmanLoop); pacmanLoop = null; updatePacmanStatus('Game Paused'); } else { pacmanLoop = setInterval(updatePacman, pacTickMs); updatePacmanStatus('Game Running'); } } }

function resetPacman() { pacmanRunning = false; pacmanPaused = false; if (pacmanLoop) { clearInterval(pacmanLoop); pacmanLoop = null; } buildMaze(); pac.x = 1; pac.y = 1; pac.dir = {x:0,y:0}; pac.nextDir={x:0,y:0}; ghosts[0].x = cols - 2; ghosts[0].y = rows - 2; ghosts[1].x = cols - 3; ghosts[1].y = rows - 2; ghosts[2].x = cols - 2; ghosts[2].y = rows - 3; pacmanState.score = 0; pacmanState.lives = 3; updatePacmanDisplay(); ensurePacHasDirection(); updatePacmanStatus('Press SPACE to start'); drawPacman(); stopGhostController(); }

function updatePacman() { if (!pacmanRunning || pacmanPaused) return; const nx = pac.x + pac.nextDir.x; const ny = pac.y + pac.nextDir.y; if (canMoveTo(nx, ny)) pac.dir = { ...pac.nextDir }; const tx = pac.x + pac.dir.x; const ty = pac.y + pac.dir.y; if (canMoveTo(tx, ty)) { pac.x = tx; pac.y = ty; } for (let i = pellets.length -1; i >= 0; i--) { const p = pellets[i]; if (p.x === pac.x && p.y === pac.y) { pacmanState.score += p.power ? 50 : 10; pellets.splice(i,1); } } for (let gi = 0; gi < ghosts.length; gi++) { const g = ghosts[gi]; if (g.x === pac.x && g.y === pac.y) { pacmanState.lives--; if (pacmanState.lives <= 0) { pacLose('Captured by ghost'); return; } else { pac.x = 1; pac.y = 1; pac.dir = {x:0,y:0}; pac.nextDir={x:0,y:0}; ghosts[0].x = cols - 2; ghosts[0].y = rows - 2; ghosts[1].x = cols - 3; ghosts[1].y = rows - 2; ghosts[2].x = cols - 2; ghosts[2].y = rows - 3; break; } } } if (pellets.length === 0) { pacmanWin(); return; } updatePacmanDisplay(); drawPacman(); }

function canMoveTo(x,y) { if (x < 0 || x >= cols || y < 0 || y >= rows) return false; return maze[y][x] === 0; }

function randomGhostMove(g) { const options = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]; for (let i = options.length-1;i>0;i--) { const j = Math.floor(Math.random()*(i+1)); [options[i],options[j]]=[options[j],options[i]]; } for (const o of options) { if (canMoveTo(g.x+o.x, g.y+o.y)) return o; } return null; }

function aStarPath(startX, startY, goalX, goalY) { const inBounds = (x,y) => x >= 0 && x < cols && y >= 0 && y < rows; const key = (x,y) => `${x},${y}`; const open = new Map(); const cameFrom = new Map(); const gScore = new Map(); function h(x,y) { return Math.abs(x - goalX) + Math.abs(y - goalY); } const startKey = key(startX,startY); open.set(startKey, h(startX,startY)); gScore.set(startKey, 0); while (open.size > 0) { let currentKey = null; let currentF = Infinity; for (const [k,f] of open.entries()) { if (f < currentF) { currentF = f; currentKey = k; } } const [cx, cy] = currentKey.split(',').map(Number); if (cx === goalX && cy === goalY) { const path = []; let k = currentKey; while (cameFrom.has(k)) { const prev = cameFrom.get(k); const [px,py] = k.split(',').map(Number); path.push({ x: px, y: py }); k = `${prev.x},${prev.y}`; } path.reverse(); return path; } open.delete(currentKey); const neighbors = [{x:cx+1,y:cy},{x:cx-1,y:cy},{x:cx,y:cy+1},{x:cx,y:cy-1}]; for (const n of neighbors) { if (!inBounds(n.x,n.y)) continue; if (!canMoveTo(n.x,n.y)) continue; const nk = key(n.x,n.y); const tentativeG = gScore.get(currentKey) + 1; if (tentativeG < (gScore.get(nk) || Infinity)) { cameFrom.set(nk, { x: cx, y: cy }); gScore.set(nk, tentativeG); open.set(nk, tentativeG + h(n.x,n.y)); } } } return null; }

let ghostPath = []; let ghostStepInterval = 300;

function startGhostController() { stopGhostController(); ghosts.forEach((g, idx) => { const interval = Math.max(140, ghostBaseInterval - idx * 40); const id = setInterval(() => { if (!pacmanRunning) return; const path = aStarPath(g.x, g.y, pac.x, pac.y); if (path && path.length > 0) { const next = path[0]; g.x = next.x; g.y = next.y; } else { const step = randomGhostMove(g); if (step) { g.x += step.x; g.y += step.y; } } }, interval); g._intervalId = id; }); }

function stopGhostController() { ghosts.forEach(g => { if (g._intervalId) { clearInterval(g._intervalId); delete g._intervalId; } }); }

function pacLose(reason) { pacmanRunning = false; if (pacmanLoop) { clearInterval(pacmanLoop); pacmanLoop = null; } stopGhostController(); const status = document.getElementById('pacman-game-status'); if (status) status.textContent = `You lost: ${reason}`; const overlay = document.getElementById('pacman-lose-overlay'); if (overlay) { const title = document.getElementById('pacman-lose-title'); const reasonEl = document.getElementById('pacman-lose-reason'); if (title) title.textContent = 'Pac-Man Lost!'; if (reasonEl) reasonEl.textContent = reason; overlay.classList.add('show'); overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; const btn = document.getElementById('pacman-restart-btn'); if (btn) btn.focus(); } }

function pacmanWin() { pacmanRunning = false; if (pacmanLoop) { clearInterval(pacmanLoop); pacmanLoop = null; } const status = document.getElementById('pacman-game-status'); if (status) status.textContent = 'You cleared the maze!'; }

function drawPacman() { if (!pacmanCtx) return; pacmanCtx.fillStyle = 'rgba(0,0,0,0.95)'; pacmanCtx.fillRect(0,0,pacmanCanvas.width,pacmanCanvas.height); pacmanCtx.fillStyle = '#204080'; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (maze[r][c] === 1) pacmanCtx.fillRect(c*tileSize, r*tileSize, tileSize, tileSize); pacmanCtx.fillStyle = '#ffd86b'; pellets.forEach(p => { const size = p.power ? 6 : 3; pacmanCtx.beginPath(); pacmanCtx.arc(p.x*tileSize + tileSize/2, p.y*tileSize + tileSize/2, size, 0, Math.PI*2); pacmanCtx.fill(); }); pacmanCtx.fillStyle = '#ffd86b'; pacmanCtx.beginPath(); pacmanCtx.arc(pac.x*tileSize + tileSize/2, pac.y*tileSize + tileSize/2, tileSize/2 -2, 0, Math.PI*2); pacmanCtx.fill(); ghosts.forEach(g => { pacmanCtx.fillStyle = g.color || '#ff6b6b'; pacmanCtx.fillRect(g.x*tileSize+2, g.y*tileSize+4, tileSize-4, tileSize-6); }); }

function updatePacmanDisplay() { document.getElementById('pacman-score').textContent = pacmanState.score; document.getElementById('pacman-lives').textContent = pacmanState.lives; }

function updatePacmanStatus(message) { const statusEl = document.getElementById('pacman-game-status'); if (statusEl) statusEl.textContent = message; }

if (typeof window !== 'undefined') {
  window.App = window.App || {};
  window.App.features = window.App.features || {};
  window.App.features.initPacman = window.App.features.initPacman || initPacman;
  window.App.debug && window.App.debug('pacman module loaded. initPacman registered');
}

export { initPacman, startPacman, resetPacman };
