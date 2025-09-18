// Consolidated JavaScript for time/date, theme toggle, and quote functionality
document.addEventListener('DOMContentLoaded', function() {
  // ===== TIME/DATE FUNCTIONALITY =====
  const dateEl = document.getElementById('date');
  const nyTimeEl = document.getElementById('time-ny');

  function pad(n){ return n.toString().padStart(2,'0'); }

  function updateDateAndTime(){
    const now = new Date();
    // local date (top-left)
    const localDate = now.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
    dateEl.textContent = localDate;

    // New York time in standard (12-hour) format with AM/PM
    try{
      const nyFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      });
      const parts = nyFormatter.format(now);
      nyTimeEl.textContent = parts;
    }catch(e){
      // fallback: compute offset from UTC (not reliable for DST)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nyOffset = -4; // assume EDT default; best-effort fallback
      const ny = new Date(utc + (3600000 * nyOffset));
      const hours = ny.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = ((hours + 11) % 12) + 1;
      nyTimeEl.textContent = `${h12}:${pad(ny.getMinutes())}:${pad(ny.getSeconds())} ${ampm}`;
    }
  }

  // ===== THEME TOGGLE FUNCTIONALITY =====
  const themeBtn = document.getElementById('themeBtn');
  const root = document.documentElement;
  let alt = false;

  function toggleTheme(){
    alt = !alt;
    themeBtn.setAttribute('aria-pressed', String(alt));
    // add a transient transition class so CSS animation can run
    document.body.classList.add('theme-transition');
    // toggle the theme class used for custom properties
    document.body.classList.toggle('theme-alt', alt);
    // remove the transition helper after the animation finishes so it can be retriggered
    window.setTimeout(()=> document.body.classList.remove('theme-transition'), 520);
    
    // small extra: change page-level background immediately
    if(alt){
      document.documentElement.style.setProperty('--bg','#08121a');
      // change button look slightly
      themeBtn.style.background = 'linear-gradient(180deg,#9ea8b8,#6f7b8b)';
      themeBtn.style.color = '#fff';
    } else {
      document.documentElement.style.setProperty('--bg','#000000');
      themeBtn.style.background = '';
      themeBtn.style.color = '#111';
    }
  }

  // ===== QUOTE FUNCTIONALITY =====
  const quotes = [
    {q: "Be yourself; everyone else is already taken.", a: 'Oscar Wilde'},
    {q: "The only limit to our realization of tomorrow is our doubts of today.", a: 'Franklin D. Roosevelt'},
    {q: "In the middle of difficulty lies opportunity.", a: 'Albert Einstein'},
    {q: "What we think, we become.", a: 'Buddha'},
    {q: "Action is the foundational key to all success.", a: 'Pablo Picasso'},
    {q: "Your time is limited, don't waste it living someone else's life.", a: 'Steve Jobs'},
    {q: "The best revenge is massive success.", a: 'Frank Sinatra'}
  ];

  const quoteEl = document.getElementById('quote');
  const authorEl = document.getElementById('author');
  const newQuoteBtn = document.getElementById('newQuoteBtn');

  function getRandomQuoteIndex(){ 
    return Math.floor(Math.random() * quotes.length); 
  }

  function setQuote(index){
    const item = quotes[index];
    quoteEl.textContent = `"${item.q}"`;
    authorEl.textContent = `— ${item.a}`;
  }

  // ===== EVENT LISTENERS =====
  // Only add event listeners if the elements exist (for pages that don't have all features)
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  if (newQuoteBtn) {
    newQuoteBtn.addEventListener('click', () => setQuote(getRandomQuoteIndex()));
  }

  // ===== INITIALIZATION =====
  // Initialize time/date functionality if elements exist
  if (dateEl && nyTimeEl) {
    updateDateAndTime();
    setInterval(updateDateAndTime, 1000);
    console.log('Time/date functionality initialized');
  } else {
    console.log('Time/date elements not found:', { dateEl, nyTimeEl });
  }

  // Initialize quote functionality if elements exist
  if (quoteEl && authorEl) {
    setQuote(getRandomQuoteIndex());
    console.log('Quote functionality initialized');
  }

  // Initialize theme toggle if element exists
  if (themeBtn) {
    console.log('Theme toggle initialized');
  }

  // ===== TIC TAC TOE FUNCTIONALITY =====
  const cells = document.querySelectorAll('.cell');
  const gameStatusEl = document.getElementById('game-status');
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreTieEl = document.getElementById('score-tie');
  const resetGameBtn = document.getElementById('resetGameBtn');
  const resetScoreBtn = document.getElementById('resetScoreBtn');

  let currentPlayer = 'X';
  let gameBoard = ['', '', '', '', '', '', '', '', ''];
  let gameActive = true;
  let ticTacToeScores = {
    X: 0,
    O: 0,
    tie: 0
  };

  // Winning combinations
  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  function updateScore() {
    if (scoreXEl) scoreXEl.textContent = ticTacToeScores.X;
    if (scoreOEl) scoreOEl.textContent = ticTacToeScores.O;
    if (scoreTieEl) scoreTieEl.textContent = ticTacToeScores.tie;
  }

  function updateGameStatus(message) {
    if (gameStatusEl) {
      gameStatusEl.textContent = message;
    }
  }

  function showResetButton() {
    if (resetGameBtn) {
      resetGameBtn.classList.add('show');
    }
  }

  function hideResetButton() {
    if (resetGameBtn) {
      resetGameBtn.classList.remove('show');
    }
  }

  function checkWinner() {
    for (let condition of winningConditions) {
      const [a, b, c] = condition;
      if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
        // Highlight winning cells
        condition.forEach(index => {
          cells[index].classList.add('winning');
        });
        return gameBoard[a];
      }
    }
    return gameBoard.includes('') ? null : 'tie';
  }

  // Pure board-check helper (no DOM side-effects) for AI simulation
  function checkWinnerSim(board) {
    for (let condition of winningConditions) {
      const [a, b, c] = condition;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.includes('') ? null : 'tie';
  }

  // Apply a move for player at index (updates UI and game state)
  function applyMove(index, player) {
    if (!gameActive || gameBoard[index] !== '') return;
    gameBoard[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    cell.disabled = true;

    const winner = checkWinner();
    if (winner) {
      gameActive = false;
      if (winner === 'tie') {
        updateGameStatus("It's a tie!");
        ticTacToeScores.tie++;
      } else {
        updateGameStatus(`Player ${winner} wins!`);
        ticTacToeScores[winner]++;
      }
      updateScore();
      showResetButton();
      return;
    }

    // Switch turns
    currentPlayer = player === 'X' ? 'O' : 'X';
    updateGameStatus(`Player ${currentPlayer}'s turn`);
  }

  // ===== BOT (Player O) - intermediate skill =====
  function findBestMove() {
    // 1) Win if possible
    for (let i = 0; i < 9; i++) {
      if (gameBoard[i] === '') {
        const copy = gameBoard.slice();
        copy[i] = 'O';
        if (checkWinnerSim(copy) === 'O') return i;
      }
    }
    // 2) Block opponent win
    for (let i = 0; i < 9; i++) {
      if (gameBoard[i] === '') {
        const copy = gameBoard.slice();
        copy[i] = 'X';
        if (checkWinnerSim(copy) === 'X') return i;
      }
    }
    // 3) Take center
    if (gameBoard[4] === '') return 4;
    // 4) Take any corner
    const corners = [0,2,6,8].filter(i => gameBoard[i] === '');
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
    // 5) Take any side
    const sides = [1,3,5,7].filter(i => gameBoard[i] === '');
    if (sides.length) return sides[Math.floor(Math.random()*sides.length)];
    return null;
  }

  function botMove() {
    if (!gameActive) return;
    const thinkingEl = document.getElementById('bot-thinking');
    if (thinkingEl) {
      thinkingEl.classList.remove('hidden');
      thinkingEl.setAttribute('aria-hidden','false');
    }
    // small thinking delay
    setTimeout(() => {
      const idx = findBestMove();
      if (idx !== null && gameBoard[idx] === '') {
        applyMove(idx, 'O');
      }
      if (thinkingEl) {
        thinkingEl.classList.add('hidden');
        thinkingEl.setAttribute('aria-hidden','true');
      }
    }, 350);
  }

  function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.dataset.index);

    if (gameBoard[index] !== '' || !gameActive) return;

    // Only allow human (X) clicks; O will be played by bot
    if (currentPlayer !== 'X') return;

    applyMove(index, currentPlayer);

    // If bot's turn now, trigger bot
    if (currentPlayer === 'O' && gameActive) {
      botMove();
    }
  }

  function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    
    cells.forEach(cell => {
      cell.textContent = '';
      cell.disabled = false;
      cell.classList.remove('x', 'o', 'winning');
    });
    // hide bot indicator when resetting
    const thinkingEl = document.getElementById('bot-thinking');
    if (thinkingEl) {
      thinkingEl.classList.add('hidden');
      thinkingEl.setAttribute('aria-hidden','true');
    }
    
    updateGameStatus("Player X's turn");
    hideResetButton();
  }

  function resetScore() {
    ticTacToeScores = { X: 0, O: 0, tie: 0 };
    updateScore();
    resetGame();
  }

  // ===== TIC TAC TOE EVENT LISTENERS =====
  if (cells.length > 0) {
    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
    });
  }

  if (resetGameBtn) {
    resetGameBtn.addEventListener('click', resetGame);
  }

  if (resetScoreBtn) {
    resetScoreBtn.addEventListener('click', resetScore);
  }

  // Initialize tic tac toe if elements exist
  if (cells.length > 0) {
    // Ensure X always starts
    currentPlayer = 'X';
    gameActive = true;
    updateScore();
    updateGameStatus("Player X's turn");
    hideResetButton(); // Ensure reset button is hidden at start
    // Hide bot indicator if present
    const thinkingEl = document.getElementById('bot-thinking');
    if (thinkingEl) {
      thinkingEl.classList.add('hidden');
      thinkingEl.setAttribute('aria-hidden','true');
    }
    console.log('Tic Tac Toe initialized (X starts)');
  }

  // ===== INTERACTIVE SHOWCASE FUNCTIONALITY =====
  
  // Demo Tab Switching
  const demoTabs = document.querySelectorAll('.demo-tab');
  const demoSections = document.querySelectorAll('.demo-section');
  
  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const demoType = tab.dataset.demo;
      
      // Remove active class from all tabs and sections
      demoTabs.forEach(t => t.classList.remove('active'));
      demoSections.forEach(s => s.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding section
      tab.classList.add('active');
      document.getElementById(`${demoType}-demo`).classList.add('active');
      
      // Initialize the selected demo
      initializeDemo(demoType);
    });
  });

  // ===== PARTICLE PHYSICS SANDBOX =====
  let particleCanvas, particleCtx, particles = [];
  let gravity = 0.5;
  let mouseX = 0, mouseY = 0;
  let animationId;

  function initParticleSystem() {
    particleCanvas = document.getElementById('particleCanvas');
    if (!particleCanvas) return;
    
    particleCtx = particleCanvas.getContext('2d');
    particles = [];
    
    // Mouse tracking
    particleCanvas.addEventListener('mousemove', (e) => {
      const rect = particleCanvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    
    // Particle creation on click
    particleCanvas.addEventListener('click', (e) => {
      const rect = particleCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createParticle(x, y);
    });
    
    // Control event listeners
    document.getElementById('addParticles')?.addEventListener('click', addRandomParticles);
    document.getElementById('toggleGravity')?.addEventListener('click', toggleGravity);
    document.getElementById('explosion')?.addEventListener('click', createExplosion);
    document.getElementById('resetParticles')?.addEventListener('click', resetParticles);
    
    const gravitySlider = document.getElementById('gravitySlider');
    const gravityValue = document.getElementById('gravityValue');
    if (gravitySlider && gravityValue) {
      gravitySlider.addEventListener('input', (e) => {
        gravity = parseFloat(e.target.value);
        gravityValue.textContent = gravity.toFixed(1);
      });
    }
    
    animateParticles();
  }

  function createParticle(x, y, vx = 0, vy = 0) {
    particles.push({
      x, y,
      vx: vx + (Math.random() - 0.5) * 4,
      vy: vy + (Math.random() - 0.5) * 4,
      radius: Math.random() * 8 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.005
    });
  }

  function addRandomParticles() {
    for (let i = 0; i < 10; i++) {
      createParticle(
        Math.random() * particleCanvas.width,
        Math.random() * particleCanvas.height
      );
    }
  }

  function createExplosion() {
    const centerX = particleCanvas.width / 2;
    const centerY = particleCanvas.height / 2;
    
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = Math.random() * 8 + 4;
      createParticle(
        centerX,
        centerY,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    }
  }

  function toggleGravity() {
    gravity = gravity > 0 ? 0 : 0.5;
    document.getElementById('gravitySlider').value = gravity;
    document.getElementById('gravityValue').textContent = gravity.toFixed(1);
  }

  function resetParticles() {
    particles = [];
  }

  function animateParticles() {
    if (!particleCtx) return;
    
    particleCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    particleCtx.fillRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      
      // Apply gravity
      p.vy += gravity;
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply friction
      p.vx *= 0.99;
      p.vy *= 0.99;
      
      // Boundary collision
      if (p.x < p.radius || p.x > particleCanvas.width - p.radius) {
        p.vx *= -0.8;
        p.x = Math.max(p.radius, Math.min(particleCanvas.width - p.radius, p.x));
      }
      if (p.y < p.radius || p.y > particleCanvas.height - p.radius) {
        p.vy *= -0.8;
        p.y = Math.max(p.radius, Math.min(particleCanvas.height - p.radius, p.y));
      }
      
      // Mouse attraction
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        const force = (100 - distance) / 100 * 0.1;
        p.vx += (dx / distance) * force;
        p.vy += (dy / distance) * force;
      }
      
      // Update life
      p.life -= p.decay;
      
      // Remove dead particles
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      
      // Draw particle
      particleCtx.save();
      particleCtx.globalAlpha = p.life;
      particleCtx.fillStyle = p.color;
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      particleCtx.fill();
      particleCtx.restore();
    }
    
    animationId = requestAnimationFrame(animateParticles);
  }

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
    switch(demoType) {
      case 'particles':
        initParticleSystem();
        break;
      case 'neural':
        initNeuralNetwork();
        break;
      case 'matrix':
        initMatrixRain();
        break;
    }
  }

  // Initialize first demo on page load
  if (document.querySelector('.demo-tab.active')) {
    const activeDemo = document.querySelector('.demo-tab.active').dataset.demo;
    initializeDemo(activeDemo);
  }

  // ===== SNAKE GAME FUNCTIONALITY =====
  let snakeCanvas, snakeCtx;
  let snake = [];
  let food = {};
  // Snake loss state
  let snakeLost = false;
  let snakeLoseReason = '';
  // Confetti particles for loss animation
  let confettiParticles = [];
  let confettiActive = false;
  let direction = { x: 0, y: 0 };
  let nextDirection = { x: 0, y: 0 };
  let gameRunning = false;
  let gamePaused = false;
  let score = 0;
  let highScore = localStorage.getItem('snakeHighScore') || 0;
  let gameSpeed = 200; // Default to slow speed
  let gameLoop;
  let currentSpeed = 'slow';

  function initSnakeGame() {
    snakeCanvas = document.getElementById('snakeCanvas');
    if (!snakeCanvas) return;
    
    snakeCtx = snakeCanvas.getContext('2d');
    
    // Initialize game state
    resetSnakeGame();
    
    // Event listeners
    document.getElementById('startSnakeBtn')?.addEventListener('click', startSnakeGame);
    document.getElementById('pauseSnakeBtn')?.addEventListener('click', pauseSnakeGame);
    document.getElementById('resetSnakeBtn')?.addEventListener('click', resetSnakeGame);
    
    // Speed control event listeners
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', changeGameSpeed);
    });
    
    // Keyboard controls
    document.addEventListener('keydown', handleSnakeKeyPress);

    // Touch controls for mobile: detect swipes on the snake canvas
    let touchStartX = null;
    let touchStartY = null;

    function onSnakeTouchStart(e) {
      const t = e.touches[0];
      if (!t) return;
      const rect = snakeCanvas.getBoundingClientRect();
      touchStartX = t.clientX - rect.left;
      touchStartY = t.clientY - rect.top;
      e.preventDefault();
    }

    function onSnakeTouchMove(e) {
      if (!touchStartX || !touchStartY) return;
      const t = e.touches[0];
      if (!t) return;
      const rect = snakeCanvas.getBoundingClientRect();
      const moveX = (t.clientX - rect.left) - touchStartX;
      const moveY = (t.clientY - rect.top) - touchStartY;

      // determine primary direction of swipe
      if (Math.abs(moveX) > Math.abs(moveY)) {
        // horizontal swipe
        if (moveX > 20) {
          // swipe right
          if (direction.x === 0) nextDirection = { x: 1, y: 0 };
        } else if (moveX < -20) {
          // swipe left
          if (direction.x === 0) nextDirection = { x: -1, y: 0 };
        }
      } else {
        // vertical swipe
        if (moveY > 20) {
          // swipe down
          if (direction.y === 0) nextDirection = { x: 0, y: 1 };
        } else if (moveY < -20) {
          // swipe up
          if (direction.y === 0) nextDirection = { x: 0, y: -1 };
        }
      }

      // prevent page scroll while interacting
      e.preventDefault();
    }

    snakeCanvas.addEventListener('touchstart', onSnakeTouchStart, { passive: false });
    snakeCanvas.addEventListener('touchmove', onSnakeTouchMove, { passive: false });
    
    // Update high score display
    document.getElementById('snake-high-score').textContent = highScore;

    // Show snake touch indicator if touch device
    if (('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) {
      const snakeBadge = document.getElementById('snake-touch-indicator');
      if (snakeBadge) {
        snakeBadge.style.display = 'inline-flex';
        snakeBadge.setAttribute('aria-hidden', 'false');
      }
    }
    
    // Create a DOM overlay for loss message (accessible, styled)
    let existingOverlay = document.getElementById('snake-lose-overlay');
    if (!existingOverlay) {
      const overlay = document.createElement('div');
      overlay.id = 'snake-lose-overlay';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.className = '';

      const inner = document.createElement('div');
      inner.className = 'panel';

      const title = document.createElement('div');
      title.id = 'snake-lose-title';
      title.className = 'title';
      title.textContent = 'You Lost!';

      const reason = document.createElement('div');
      reason.id = 'snake-lose-reason';
      reason.className = 'reason';

      const btn = document.createElement('button');
      btn.id = 'snake-restart-btn';
      btn.className = 'restart-btn';
      btn.textContent = 'Restart';
      btn.addEventListener('click', () => {
        // hide overlay and restart
        overlay.classList.remove('show');
        confettiActive = false;
        confettiParticles = [];
        resetSnakeGame();
        startSnakeGame();
      });

      inner.appendChild(title);
      inner.appendChild(reason);
      inner.appendChild(btn);
      overlay.appendChild(inner);
      // position overlay relative to canvas container
      const container = snakeCanvas.parentElement || document.body;
      container.style.position = container.style.position || 'relative';
      container.appendChild(overlay);

      // helper to position overlay over canvas
      function positionOverlay() {
        const rect = snakeCanvas.getBoundingClientRect();
        const contRect = container.getBoundingClientRect();
        overlay.style.left = (rect.left - contRect.left) + 'px';
        overlay.style.top = (rect.top - contRect.top) + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
      }

      // initial positioning
      positionOverlay();

      // reposition on window resize or page layout changes
      window.addEventListener('resize', positionOverlay);
      // store a pointer so we can call it if needed
      overlay._positionOverlay = positionOverlay;
    }
    
    // Initial draw
    drawSnakeGame();
  }

  function resetSnakeGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
  // clear lose state when resetting
  snakeLost = false;
  snakeLoseReason = '';
  // hide DOM overlay if present
  const overlay = document.getElementById('snake-lose-overlay');
  if (overlay) overlay.style.display = 'none';
  // stop confetti
  confettiActive = false;
  confettiParticles = [];
    gameRunning = false;
    gamePaused = false;
    
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    
    generateFood();
    updateSnakeDisplay();
    updateSnakeGameStatus('Press SPACE or click Start to begin');
    drawSnakeGame();
  }

  function startSnakeGame() {
    if (!gameRunning && !gamePaused) {
      direction = { x: 1, y: 0 }; // Start moving right
      nextDirection = { x: 1, y: 0 };
    }
    
    gameRunning = true;
    gamePaused = false;
    updateSnakeGameStatus('Game Running');
    
    if (!gameLoop) {
      gameLoop = setInterval(gameUpdate, gameSpeed);
    }
  }

  function changeGameSpeed(event) {
    const button = event.target;
    const speed = parseInt(button.dataset.speed);
    
    // Update active button
    document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Update game speed
    gameSpeed = speed;
    
    // Update current speed for reference
    if (speed === 200) currentSpeed = 'slow';
    else if (speed === 150) currentSpeed = 'normal';
    else if (speed === 100) currentSpeed = 'fast';
    
    // If game is running, restart with new speed
    if (gameRunning && !gamePaused) {
      if (gameLoop) {
        clearInterval(gameLoop);
      }
      gameLoop = setInterval(gameUpdate, gameSpeed);
    }
  }

  function pauseSnakeGame() {
    if (gameRunning) {
      gamePaused = !gamePaused;
      updateSnakeGameStatus(gamePaused ? 'Game Paused' : 'Game Running');
      
      if (gamePaused) {
        clearInterval(gameLoop);
        gameLoop = null;
      } else {
        gameLoop = setInterval(gameUpdate, gameSpeed);
      }
    }
  }

  function generateFood() {
    const gridSize = 20;
    const canvasWidth = snakeCanvas.width / gridSize;
    const canvasHeight = snakeCanvas.height / gridSize;
    // avoid spawning food on the starting cell {x:10,y:10} or on the snake body
    let attempts = 0;
    do {
      food = {
        x: Math.floor(Math.random() * canvasWidth),
        y: Math.floor(Math.random() * canvasHeight)
      };
      attempts++;
      if (attempts > 200) break; // safety to avoid infinite loop
    } while ((food.x === 10 && food.y === 10) || snake.some(segment => segment.x === food.x && segment.y === food.y));
  }

  function gameUpdate() {
    // If player already lost, don't process further updates
    if (snakeLost) {
      // ensure overlay stays visible by drawing once more
      drawSnakeGame();
      return;
    }

    if (!gameRunning || gamePaused) return;
    
    // Update direction
    direction = { ...nextDirection };
    
    // Move snake head
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= snakeCanvas.width / 20 || 
        head.y < 0 || head.y >= snakeCanvas.height / 20) {
  // mark lose reason and call game over
  snakeLost = true;
  snakeLoseReason = 'Crashed into a wall';
  gameOver();
      return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
  // head-to-body collision
  snakeLost = true;
  snakeLoseReason = 'Head to body collision';
  gameOver();
      return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      generateFood();
      updateSnakeDisplay();
    } else {
      snake.pop();
    }
    
    drawSnakeGame();
  }

  function gameOver() {
    gameRunning = false;
    gamePaused = false;
    
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHighScore', highScore);
      document.getElementById('snake-high-score').textContent = highScore;
    }
  // keep the lose reason set earlier (snakeLoseReason)
  updateSnakeGameStatus(`You lost: ${snakeLoseReason} — Final Score: ${score}`);

  // reset the board visually to original starting state but keep snakeLost true
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  // regenerate food away from the start
  generateFood();
  updateSnakeDisplay();

  // draw once so overlay appears immediately
    drawSnakeGame();

    // show DOM overlay if exists
    const overlay = document.getElementById('snake-lose-overlay');
    if (overlay) {
      const title = document.getElementById('snake-lose-title');
      const reasonEl = document.getElementById('snake-lose-reason');
      if (title) title.textContent = 'You Lost!';
      if (reasonEl) reasonEl.textContent = snakeLoseReason;
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      // allow clicks on the button
      overlay.style.pointerEvents = 'auto';
      const btn = document.getElementById('snake-restart-btn');
      if (btn) btn.focus();
    }

    // trigger confetti
    createConfetti();
  }

  // -- Confetti helpers --
  function createConfetti() {
    confettiParticles = [];
    const colors = ['#ff4d4d','#ffd86b','#6bffb8','#6bd1ff','#c86bff'];
    const count = 60;
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * snakeCanvas.width,
        y: Math.random() * (snakeCanvas.height * 0.3),
        dx: (Math.random() - 0.5) * 2,
        dy: Math.random() * 3 + 2,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        life: Math.random() * 60 + 60
      });
    }
    confettiActive = true;
  }

  function updateConfetti() {
    if (!confettiActive || !confettiParticles.length) return;
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.rot += 0.1;
      p.dy += 0.05; // gravity
      p.life--;
      if (p.life <= 0 || p.y > snakeCanvas.height + 20) confettiParticles.splice(i, 1);
    }
    if (confettiParticles.length === 0) confettiActive = false;
  }

  function drawSnakeGame() {
    if (!snakeCtx) return;
    
    // Clear canvas
    snakeCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Draw grid
    snakeCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    snakeCtx.lineWidth = 1;
    
    for (let x = 0; x < snakeCanvas.width; x += 20) {
      snakeCtx.beginPath();
      snakeCtx.moveTo(x, 0);
      snakeCtx.lineTo(x, snakeCanvas.height);
      snakeCtx.stroke();
    }
    
    for (let y = 0; y < snakeCanvas.height; y += 20) {
      snakeCtx.beginPath();
      snakeCtx.moveTo(0, y);
      snakeCtx.lineTo(snakeCanvas.width, y);
      snakeCtx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        snakeCtx.fillStyle = gameRunning ? '#00ff88' : '#ff4444';
        snakeCtx.fillRect(segment.x * 20 + 2, segment.y * 20 + 2, 16, 16);
        
        // Eyes
        snakeCtx.fillStyle = '#ffffff';
        snakeCtx.fillRect(segment.x * 20 + 5, segment.y * 20 + 5, 3, 3);
        snakeCtx.fillRect(segment.x * 20 + 12, segment.y * 20 + 5, 3, 3);
      } else {
        // Snake body
        const alpha = 1 - (index / snake.length) * 0.5;
        snakeCtx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
        snakeCtx.fillRect(segment.x * 20 + 3, segment.y * 20 + 3, 14, 14);
      }
    });
    
    // Draw food
    snakeCtx.fillStyle = '#ff4444';
    snakeCtx.beginPath();
    snakeCtx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2);
    snakeCtx.fill();
    
    // Food highlight
    snakeCtx.fillStyle = '#ff8888';
    snakeCtx.beginPath();
    snakeCtx.arc(food.x * 20 + 7, food.y * 20 + 7, 3, 0, Math.PI * 2);
    snakeCtx.fill();

    // draw confetti on top if active
    if (confettiActive && confettiParticles.length) {
      confettiParticles.forEach(p => {
        snakeCtx.save();
        snakeCtx.translate(p.x, p.y);
        snakeCtx.rotate(p.rot);
        snakeCtx.fillStyle = p.color;
        snakeCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
        snakeCtx.restore();
      });
      // update confetti for next frame
      updateConfetti();
    }

    // If player has lost, draw a centered colorful overlay with reason
    if (snakeLost) {
      const cx = snakeCanvas.width / 2;
      const cy = snakeCanvas.height / 2;
      // translucent backdrop
      snakeCtx.fillStyle = 'rgba(0,0,0,0.6)';
      snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

      // colorful title
      const gradient = snakeCtx.createLinearGradient(cx - 150, cy - 60, cx + 150, cy + 60);
      gradient.addColorStop(0, '#ff4444');
      gradient.addColorStop(0.5, '#ffdd44');
      gradient.addColorStop(1, '#44ff88');

      snakeCtx.font = 'bold 30px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      snakeCtx.textAlign = 'center';
      snakeCtx.textBaseline = 'middle';
      snakeCtx.fillStyle = gradient;
      snakeCtx.fillText('You Lost!', cx, cy - 20);

      // reason text
      snakeCtx.font = '18px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      snakeCtx.fillStyle = '#ffffff';
      snakeCtx.fillText(snakeLoseReason, cx, cy + 10);

      // subtext
      snakeCtx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      snakeCtx.fillStyle = 'rgba(255,255,255,0.9)';
      snakeCtx.fillText('Press Reset or Space to play again', cx, cy + 40);
    }
  }

  function handleSnakeKeyPress(e) {
    // If player lost, Space should reset and start a new game
    if (snakeLost && e.code === 'Space') {
      e.preventDefault();
      resetSnakeGame();
      startSnakeGame();
      return;
    }

    if (!gameRunning && e.code === 'Space') {
      e.preventDefault();
      startSnakeGame();
      return;
    }
    
    if (gameRunning && e.code === 'Space') {
      e.preventDefault();
      pauseSnakeGame();
      return;
    }
    
    if (!gameRunning || gamePaused) return;
    
    switch(e.code) {
      case 'ArrowUp':
      case 'KeyW':
        if (direction.y === 0) nextDirection = { x: 0, y: -1 };
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'KeyS':
        if (direction.y === 0) nextDirection = { x: 0, y: 1 };
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'KeyA':
        if (direction.x === 0) nextDirection = { x: -1, y: 0 };
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        if (direction.x === 0) nextDirection = { x: 1, y: 0 };
        e.preventDefault();
        break;
    }
  }

  function updateSnakeDisplay() {
    document.getElementById('snake-score').textContent = score;
    document.getElementById('snake-length').textContent = snake.length;
  }

  function updateSnakeGameStatus(message) {
    const statusEl = document.getElementById('snake-game-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  // Initialize Snake game if elements exist
  if (document.getElementById('snakeCanvas')) {
    initSnakeGame();
    console.log('Snake game initialized');
  }

  // ===== PING PONG GAME FUNCTIONALITY =====
  let pingpongCanvas, pingpongCtx;
  let pingpongGameRunning = false;
  let pingpongGamePaused = false;
  let pingpongGameLoop;

  // Game objects
  let ball = {
    x: 300,
    y: 200,
    dx: 5,
    dy: 3,
    radius: 8,
  speed: 5,
  // extra properties for acceleration behavior
  acceleration: 0,
  // max speed cap to avoid runaway physics
  maxSpeed: 12
  };

  let playerPaddle = {
    x: 50,
    y: 150,
    width: 15,
  height: 80,
  // increase player 2 paddle base speed for more responsive control
  speed: 12
  };

  let aiPaddle = {
    x: 535,
    y: 150,
    width: 15,
    height: 80,
    // AI paddle base speed (will be used as max per-frame step)
    speed: 7
  };

  // AI tuning: reaction timing (ms) and temporary speed boost when ball is close
  let aiReactionTime = 80; // lower = more reactive (in ms)
  let aiLastReact = 0;
  let aiTargetY = aiPaddle.y + aiPaddle.height / 2;
  
  // Predict the Y position of the ball when it reaches a given x (accounts for vertical bounces)
  function predictBallYAtX(targetX) {
    if (!pingpongCanvas) return ball.y;
    if (ball.dx === 0) return ball.y;
    const h = pingpongCanvas.height;
    const time = (targetX - ball.x) / ball.dx;
    if (time <= 0) return ball.y;
    let predY = ball.y + ball.dy * time;
    // reflect within [0, h]
    // handle multiple bounces via modulo arithmetic
    const period = 2 * h;
    predY = ((predY % period) + period) % period; // positive modulo
    if (predY > h) predY = period - predY;
    return predY;
  }

  let pingPongScores = {
    player: 0,
    ai: 0
  };
  let rallyCount = 0;

  // whether touch controls are enabled (set on init based on device)
  let touchControlEnabled = false;

  function initPingPongGame() {
    pingpongCanvas = document.getElementById('pingpongCanvas');
    if (!pingpongCanvas) return;
    
    pingpongCtx = pingpongCanvas.getContext('2d');
    
    // Event listeners
    document.getElementById('startPingpongBtn')?.addEventListener('click', startPingPongGame);
    document.getElementById('pausePingpongBtn')?.addEventListener('click', pausePingPongGame);
    document.getElementById('resetPingpongBtn')?.addEventListener('click', resetPingPongGame);
    
  // Keyboard controls (continuous via flags)
  document.addEventListener('keydown', (e) => { handlePingPongKeyPress(e, true); });
  document.addEventListener('keyup', (e) => { handlePingPongKeyPress(e, false); });

    // Difficulty presets (Easy/Medium/Hard)
    const difficultySelect = document.getElementById('ping-difficulty');
    const difficultyPresets = {
      Easy: { aiReactionTime: 220, aiSpeed: 4 },
      Medium: { aiReactionTime: 80, aiSpeed: 7 },
      Hard: { aiReactionTime: 40, aiSpeed: 10 }
    };

    function applyDifficulty(name) {
      const p = difficultyPresets[name] || difficultyPresets.Medium;
      aiReactionTime = p.aiReactionTime;
      aiPaddle.speed = p.aiSpeed;
    }

    // default difficulty
    // load persisted difficulty if present
    const stored = localStorage.getItem('pingDifficulty');
    const initial = stored || 'Medium';
    applyDifficulty(initial);
    if (difficultySelect) {
      difficultySelect.value = initial;
      difficultySelect.addEventListener('change', (e) => {
        const v = e.target.value;
        applyDifficulty(v);
        localStorage.setItem('pingDifficulty', v);
        // update on-screen indicator if present
        const di = document.getElementById('difficulty-indicator');
        if (di) di.textContent = v;
      });
      // set on-screen indicator initially
      const di = document.getElementById('difficulty-indicator');
      if (di) di.textContent = initial;
    }

    // Drag-only mouse control & touch control: enabled automatically on touch-capable devices.
    let dragging = false;
    let mouseMoveHandler = (e) => {
      if (!dragging) return;
      const rect = pingpongCanvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      playerPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - playerPaddle.height, y - playerPaddle.height / 2));
      updatePingPongDisplay();
      drawPingPongGame();
    };

    let touchMoveHandler = (e) => {
      if (!touchControlEnabled) return;
      const rect = pingpongCanvas.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;
      const y = touch.clientY - rect.top;
      playerPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - playerPaddle.height, y - playerPaddle.height / 2));
      updatePingPongDisplay();
      drawPingPongGame();
      e.preventDefault();
    };

    // Detect touch-capable device and enable touch controls by default
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    touchControlEnabled = !!isTouchDevice;

    if (isTouchDevice) {
      // show touch indicator badge
      const pingBadge = document.getElementById('ping-touch-indicator');
      if (pingBadge) {
        pingBadge.style.display = 'inline-flex';
        pingBadge.setAttribute('aria-hidden', 'false');
      }
      // attach touch handlers
      pingpongCanvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
      pingpongCanvas.addEventListener('touchstart', (e) => { touchMoveHandler(e); }, { passive: false });
    }

    function onMouseDown(e) {
      if (!touchControlEnabled && !isTouchDevice) return; // only allow drag when touch mode is active or on touch devices
      dragging = true;
      mouseMoveHandler(e);
    }

    function onMouseUp() {
      dragging = false;
    }

    // Attach drag start/end handlers to canvas (safe because onMouseDown checks flag)
    pingpongCanvas.addEventListener('mousedown', onMouseDown);
    pingpongCanvas.addEventListener('mouseup', onMouseUp);
    pingpongCanvas.addEventListener('mouseleave', onMouseUp);

    
    // Initial draw
    drawPingPongGame();
  }

  function startPingPongGame() {
    if (!pingpongGameRunning && !pingpongGamePaused) {
      // Reset ball position
      ball.x = pingpongCanvas.width / 2;
      ball.y = pingpongCanvas.height / 2;
      ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = (Math.random() - 0.5) * 4;
    }
    
    pingpongGameRunning = true;
    pingpongGamePaused = false;
    updatePingPongGameStatus('Game Running');
    
    if (!pingpongGameLoop) {
      pingpongGameLoop = setInterval(updatePingPongGame, 16); // ~60fps
    }
  }

  function pausePingPongGame() {
    if (pingpongGameRunning) {
      pingpongGamePaused = !pingpongGamePaused;
      updatePingPongGameStatus(pingpongGamePaused ? 'Game Paused' : 'Game Running');
      
      if (pingpongGamePaused) {
        clearInterval(pingpongGameLoop);
        pingpongGameLoop = null;
      } else {
        pingpongGameLoop = setInterval(updatePingPongGame, 16);
      }
    }
  }

  function resetPingPongGame() {
    pingPongScores.player = 0;
    pingPongScores.ai = 0;
    pingpongGameRunning = false;
    pingpongGamePaused = false;
    
    if (pingpongGameLoop) {
      clearInterval(pingpongGameLoop);
      pingpongGameLoop = null;
    }
    
    // Reset positions
    ball.x = pingpongCanvas.width / 2;
    ball.y = pingpongCanvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
    
    playerPaddle.y = (pingpongCanvas.height - playerPaddle.height) / 2;
    aiPaddle.y = (pingpongCanvas.height - aiPaddle.height) / 2;
    
    updatePingPongDisplay();
    updatePingPongGameStatus('Press SPACE or click Start to begin');
    drawPingPongGame();
  }

  // player input flags
  let playerMoveUp = false;
  let playerMoveDown = false;

  function updatePingPongGame() {
    if (!pingpongGameRunning || pingpongGamePaused) return;
    
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with top/bottom walls
    if (ball.y <= ball.radius || ball.y >= pingpongCanvas.height - ball.radius) {
      ball.dy = -ball.dy;
    }
    
    // Ball collision with paddles
    if (ball.x <= playerPaddle.x + playerPaddle.width &&
        ball.x >= playerPaddle.x &&
        ball.y >= playerPaddle.y &&
        ball.y <= playerPaddle.y + playerPaddle.height) {
  // reflect horizontally and add vertical deflection based on hit position
  ball.dx = Math.abs(ball.dx);
  ball.dy += (ball.y - (playerPaddle.y + playerPaddle.height / 2)) * 0.1;
  // increase acceleration slightly on paddle hit
  ball.acceleration = Math.min((ball.acceleration || 0) + 0.4, ball.maxSpeed - ball.speed);
  // apply acceleration to speed, cap to ball.maxSpeed
  ball.speed = Math.min(ball.speed + ball.acceleration, ball.maxSpeed);
  // ensure dx sign reflects direction
  ball.dx = Math.sign(ball.dx) * Math.abs(ball.speed);
  // amplify vertical velocity slightly for more dynamic bounces
  ball.dy = ball.dy * 1.1;
    }
    
    if (ball.x >= aiPaddle.x - ball.radius &&
        ball.x <= aiPaddle.x + aiPaddle.width &&
        ball.y >= aiPaddle.y &&
        ball.y <= aiPaddle.y + aiPaddle.height) {
  ball.dx = -Math.abs(ball.dx);
  ball.dy += (ball.y - (aiPaddle.y + aiPaddle.height / 2)) * 0.1;
  // increase acceleration slightly on paddle hit
  ball.acceleration = Math.min((ball.acceleration || 0) + 0.4, ball.maxSpeed - ball.speed);
  ball.speed = Math.min(ball.speed + ball.acceleration, ball.maxSpeed);
  ball.dx = -Math.abs(ball.speed);
  ball.dy = ball.dy * 1.1;
    }
    
    // Scoring
    if (ball.x < 0) {
      pingPongScores.ai++;
      rallyCount++;
      resetBall();
    } else if (ball.x > pingpongCanvas.width) {
      pingPongScores.player++;
      rallyCount++;
      resetBall();
    }
    
    // Apply player movement from key flags (only when touch control is not active)
    if (!touchControlEnabled) {
      if (playerMoveUp) {
        playerPaddle.y = Math.max(0, playerPaddle.y - playerPaddle.speed);
      }
      if (playerMoveDown) {
        playerPaddle.y = Math.min(pingpongCanvas.height - playerPaddle.height, playerPaddle.y + playerPaddle.speed);
      }
    }

    // AI paddle movement: predictive with reaction time
    const now = Date.now();
    if (now - aiLastReact > aiReactionTime) {
      aiLastReact = now;
      // predict where the ball will be when it reaches the AI's x
      const targetX = aiPaddle.x; // AI tries to intercept at its paddle x
      aiTargetY = predictBallYAtX(targetX);
    }

    const aiCenter = aiPaddle.y + aiPaddle.height / 2;
    const delta = aiTargetY - aiCenter;
    // move by up to aiPaddle.speed per update, scaled by ball speed for difficulty
    const step = Math.sign(delta) * Math.min(Math.abs(delta), aiPaddle.speed + Math.min(3, Math.floor(ball.speed / 2)));
    aiPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - aiPaddle.height, aiPaddle.y + step));
    
    // Keep AI paddle in bounds
    aiPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - aiPaddle.height, aiPaddle.y));
    
    updatePingPongDisplay();
    drawPingPongGame();
  }

  function resetBall() {
    ball.x = pingpongCanvas.width / 2;
    ball.y = pingpongCanvas.height / 2;
  // reset speed and acceleration when a point is scored
  ball.speed = 5;
  ball.acceleration = 0;
  ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = (Math.random() - 0.5) * 4;
  }

  function drawPingPongGame() {
    if (!pingpongCtx) return;
    
    // Clear canvas
    pingpongCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    pingpongCtx.fillRect(0, 0, pingpongCanvas.width, pingpongCanvas.height);
    
    // Draw center line
    pingpongCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    pingpongCtx.lineWidth = 2;
    pingpongCtx.setLineDash([10, 10]);
    pingpongCtx.beginPath();
    pingpongCtx.moveTo(pingpongCanvas.width / 2, 0);
    pingpongCtx.lineTo(pingpongCanvas.width / 2, pingpongCanvas.height);
    pingpongCtx.stroke();
    pingpongCtx.setLineDash([]);
    
    // Draw player paddle
    pingpongCtx.fillStyle = '#00d4ff';
    pingpongCtx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    
    // Draw AI paddle
    pingpongCtx.fillStyle = '#ff00ff';
    pingpongCtx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
    
    // Draw ball
    pingpongCtx.fillStyle = '#00ff88';
    pingpongCtx.beginPath();
    pingpongCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    pingpongCtx.fill();
    
    // Ball trail effect
    pingpongCtx.fillStyle = 'rgba(0, 255, 136, 0.3)';
    pingpongCtx.beginPath();
    pingpongCtx.arc(ball.x - ball.dx, ball.y - ball.dy, ball.radius * 0.7, 0, Math.PI * 2);
    pingpongCtx.fill();
  }

  function handlePingPongKeyPress(e, isDown) {
    // Handle start/pause on keydown only
    if (isDown && e.code === 'Space') {
      e.preventDefault();
      if (!pingpongGameRunning) startPingPongGame();
      else if (pingpongGameRunning) pausePingPongGame();
      return;
    }

    // When game isn't running, don't process movement keys
    if (!pingpongGameRunning || pingpongGamePaused) return;

    // Movement flags
    if (e.code === 'ArrowUp') {
      playerMoveUp = !!isDown;
      // Speed boost on up key for responsiveness
      if (isDown && !touchControlEnabled) {
        playerPaddle.y = Math.max(0, playerPaddle.y - Math.round(playerPaddle.speed * 1.8));
      }
      e.preventDefault();
    }

    if (e.code === 'KeyW') {
      playerMoveUp = !!isDown;
      if (isDown && !touchControlEnabled) {
        playerPaddle.y = Math.max(0, playerPaddle.y - Math.round(playerPaddle.speed * 2));
      }
      e.preventDefault();
    }

    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      playerMoveDown = !!isDown;
      e.preventDefault();
    }
  }

  function updatePingPongDisplay() {
    document.getElementById('player-score').textContent = pingPongScores.player;
    document.getElementById('ai-score').textContent = pingPongScores.ai;
  const rc = document.getElementById('rally-count');
  if (rc) rc.textContent = rallyCount;
  const di = document.getElementById('difficulty-indicator');
  if (di) di.textContent = (localStorage.getItem('pingDifficulty') || 'Medium');
  }

  function updatePingPongGameStatus(message) {
    const statusEl = document.getElementById('pingpong-game-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  // Initialize Ping Pong game if elements exist
  if (document.getElementById('pingpongCanvas')) {
    initPingPongGame();
    console.log('Ping Pong game initialized');
  }

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

  function startPacman() {
    if (!pacmanRunning) {
      pacmanRunning = true; pacmanPaused = false;
  if (!pacmanLoop) pacmanLoop = setInterval(updatePacman, pacTickMs);
      updatePacmanStatus('Game Running');
  startGhostController();
    }
  }

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
    ghost.x = cols - 2; ghost.y = rows - 2; ghost.dir = {x:0,y:0};
    pacmanState.score = 0; pacmanState.lives = 3;
    updatePacmanDisplay();
    updatePacmanStatus('Press SPACE to start');
    drawPacman();
  stopGhostController();
  }

  function updatePacman() {
    if (!pacmanRunning || pacmanPaused) return;
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

  function stopGhostController() {
    if (ghostIntervalId) { clearInterval(ghostIntervalId); ghostIntervalId = null; }
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
    console.log('Pac-Man initialized');
  }

});