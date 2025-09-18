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
    
    // Initial draw
    drawSnakeGame();
  }

  function resetSnakeGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
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
    
    do {
      food = {
        x: Math.floor(Math.random() * canvasWidth),
        y: Math.floor(Math.random() * canvasHeight)
      };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  }

  function gameUpdate() {
    if (!gameRunning || gamePaused) return;
    
    // Update direction
    direction = { ...nextDirection };
    
    // Move snake head
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= snakeCanvas.width / 20 || 
        head.y < 0 || head.y >= snakeCanvas.height / 20) {
      gameOver();
      return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
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
    
    updateSnakeGameStatus(`Game Over! Final Score: ${score}`);
    drawSnakeGame();
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
  }

  function handleSnakeKeyPress(e) {
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
    speed: 5
  };

  let playerPaddle = {
    x: 50,
    y: 150,
    width: 15,
    height: 80,
    speed: 6
  };

  let aiPaddle = {
    x: 535,
    y: 150,
    width: 15,
    height: 80,
    speed: 4
  };

  let pingPongScores = {
    player: 0,
    ai: 0
  };

  function initPingPongGame() {
    pingpongCanvas = document.getElementById('pingpongCanvas');
    if (!pingpongCanvas) return;
    
    pingpongCtx = pingpongCanvas.getContext('2d');
    
    // Event listeners
    document.getElementById('startPingpongBtn')?.addEventListener('click', startPingPongGame);
    document.getElementById('pausePingpongBtn')?.addEventListener('click', pausePingPongGame);
    document.getElementById('resetPingpongBtn')?.addEventListener('click', resetPingPongGame);
    
    // Keyboard controls
    document.addEventListener('keydown', handlePingPongKeyPress);

    // Mouse control toggle (drag-only to avoid accidental movement)
    const mouseToggle = document.getElementById('mouseControlToggle');
    let mouseControlEnabled = false;
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
      if (!mouseControlEnabled) return;
      const rect = pingpongCanvas.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;
      const y = touch.clientY - rect.top;
      playerPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - playerPaddle.height, y - playerPaddle.height / 2));
      updatePingPongDisplay();
      drawPingPongGame();
      e.preventDefault();
    };

    if (mouseToggle) {
      mouseToggle.addEventListener('change', (ev) => {
        mouseControlEnabled = ev.target.checked;
        if (!mouseControlEnabled) {
          // ensure dragging state cleared
          dragging = false;
          pingpongCanvas.removeEventListener('mousemove', mouseMoveHandler);
          pingpongCanvas.removeEventListener('mouseup', onMouseUp);
          pingpongCanvas.removeEventListener('mouseleave', onMouseUp);
          pingpongCanvas.removeEventListener('touchmove', touchMoveHandler);
        } else {
          // attach listeners for drag and touch
          pingpongCanvas.addEventListener('mousemove', mouseMoveHandler);
          pingpongCanvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
        }
      });
    }

    function onMouseDown(e) {
      if (!mouseControlEnabled) return;
      dragging = true;
      mouseMoveHandler(e);
    }

    function onMouseUp() {
      dragging = false;
    }

    // Attach drag start/end handlers to canvas
    pingpongCanvas.addEventListener('mousedown', onMouseDown);
    pingpongCanvas.addEventListener('mouseup', onMouseUp);
    pingpongCanvas.addEventListener('mouseleave', onMouseUp);
    // Touch equivalents: touching the canvas enables direct control (if toggle on)
    pingpongCanvas.addEventListener('touchstart', (e) => {
      if (!mouseControlEnabled) return;
      touchMoveHandler(e);
    }, { passive: false });

    
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
      ball.dx = Math.abs(ball.dx);
      ball.dy += (ball.y - (playerPaddle.y + playerPaddle.height / 2)) * 0.1;
      ball.speed = Math.min(ball.speed + 0.5, 10);
      ball.dx = ball.speed;
      ball.dy = ball.dy * 1.1;
    }
    
    if (ball.x >= aiPaddle.x - ball.radius &&
        ball.x <= aiPaddle.x + aiPaddle.width &&
        ball.y >= aiPaddle.y &&
        ball.y <= aiPaddle.y + aiPaddle.height) {
      ball.dx = -Math.abs(ball.dx);
      ball.dy += (ball.y - (aiPaddle.y + aiPaddle.height / 2)) * 0.1;
      ball.speed = Math.min(ball.speed + 0.5, 10);
      ball.dx = -ball.speed;
      ball.dy = ball.dy * 1.1;
    }
    
    // Scoring
    if (ball.x < 0) {
      pingPongScores.ai++;
      resetBall();
    } else if (ball.x > pingpongCanvas.width) {
      pingPongScores.player++;
      resetBall();
    }
    
    // AI paddle movement
    const aiCenter = aiPaddle.y + aiPaddle.height / 2;
    if (aiCenter < ball.y - 10) {
      aiPaddle.y += aiPaddle.speed;
    } else if (aiCenter > ball.y + 10) {
      aiPaddle.y -= aiPaddle.speed;
    }
    
    // Keep AI paddle in bounds
    aiPaddle.y = Math.max(0, Math.min(pingpongCanvas.height - aiPaddle.height, aiPaddle.y));
    
    updatePingPongDisplay();
    drawPingPongGame();
  }

  function resetBall() {
    ball.x = pingpongCanvas.width / 2;
    ball.y = pingpongCanvas.height / 2;
    ball.speed = 5;
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

  function handlePingPongKeyPress(e) {
    if (!pingpongGameRunning && e.code === 'Space') {
      e.preventDefault();
      startPingPongGame();
      return;
    }
    
    if (pingpongGameRunning && e.code === 'Space') {
      e.preventDefault();
      pausePingPongGame();
      return;
    }
    
    if (!pingpongGameRunning || pingpongGamePaused) return;
    
    switch(e.code) {
      case 'ArrowUp':
        // ArrowUp moves up faster
        playerPaddle.y = Math.max(0, playerPaddle.y - Math.round(playerPaddle.speed * 1.8));
        e.preventDefault();
        break;
      case 'KeyW':
        // W moves up even slightly faster for responsiveness
        playerPaddle.y = Math.max(0, playerPaddle.y - Math.round(playerPaddle.speed * 2));
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'KeyS':
        // If mouse/drag control is enabled, ignore keyboard down to prevent conflict
        if (document.getElementById('mouseControlToggle')?.checked) break;
        playerPaddle.y = Math.min(pingpongCanvas.height - playerPaddle.height, playerPaddle.y + playerPaddle.speed);
        e.preventDefault();
        break;
    }
  }

  function updatePingPongDisplay() {
    document.getElementById('player-score').textContent = pingPongScores.player;
    document.getElementById('ai-score').textContent = pingPongScores.ai;
    document.getElementById('ball-speed').textContent = Math.round(ball.speed);
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

  // ===== GALAGA GAME FUNCTIONALITY =====
  let galagaCanvas, galagaCtx;
  let galagaGameRunning = false;
  let galagaGamePaused = false;
  let galagaGameLoop;

  // Game objects
  let player = {
    x: 300,
    y: 450,
    width: 40,
    height: 20,
    speed: 5
  };

  let bullets = [];
  let enemies = [];
  let enemyBullets = [];
  let galagaParticles = [];

  let gameState = {
    score: 0,
    lives: 3,
    level: 1,
    enemySpeed: 1,
    enemyShootChance: 0.02
  };

  function initGalagaGame() {
    galagaCanvas = document.getElementById('galagaCanvas');
    if (!galagaCanvas) return;
    
    galagaCtx = galagaCanvas.getContext('2d');
    
    // Initialize player position
    player.x = galagaCanvas.width / 2 - player.width / 2;
    player.y = galagaCanvas.height - 50;
    
    // Event listeners
    document.getElementById('startGalagaBtn')?.addEventListener('click', startGalagaGame);
    document.getElementById('pauseGalagaBtn')?.addEventListener('click', pauseGalagaGame);
    document.getElementById('resetGalagaBtn')?.addEventListener('click', resetGalagaGame);
    
    // Keyboard controls
    document.addEventListener('keydown', handleGalagaKeyPress);
    
    createEnemyFormation();
    updateGalagaDisplay();
    updateGalagaGameStatus('Press SPACE or click Start to begin defending Earth!');
    drawGalagaGame();
  }

  function startGalagaGame() {
    galagaGameRunning = true;
    galagaGamePaused = false;
    updateGalagaGameStatus('Defend Earth!');
    
    if (!galagaGameLoop) {
      galagaGameLoop = setInterval(updateGalagaGame, 16); // ~60fps
    }
  }

  function pauseGalagaGame() {
    if (galagaGameRunning) {
      galagaGamePaused = !galagaGamePaused;
      updateGalagaGameStatus(galagaGamePaused ? 'Game Paused' : 'Defend Earth!');
      
      if (galagaGamePaused) {
        clearInterval(galagaGameLoop);
        galagaGameLoop = null;
      } else {
        galagaGameLoop = setInterval(updateGalagaGame, 16);
      }
    }
  }

  function resetGalagaGame() {
    galagaGameRunning = false;
    galagaGamePaused = false;
    
    if (galagaGameLoop) {
      clearInterval(galagaGameLoop);
      galagaGameLoop = null;
    }
    
    // Reset game state
    gameState = {
      score: 0,
      lives: 3,
      level: 1,
      enemySpeed: 1,
      enemyShootChance: 0.02
    };
    
    // Reset arrays
    bullets = [];
    enemyBullets = [];
    particles = [];
    
    // Reset player
    player.x = galagaCanvas.width / 2 - player.width / 2;
    player.y = galagaCanvas.height - 50;
    
    createEnemyFormation();
    updateGalagaDisplay();
    updateGalagaGameStatus('Press SPACE or click Start to begin defending Earth!');
    drawGalagaGame();
  }

  function createEnemyFormation() {
    enemies = [];
    const rows = 4;
    const cols = 10;
    const startX = 50;
    const startY = 50;
    const spacing = 50;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        enemies.push({
          x: startX + col * spacing,
          y: startY + row * spacing,
          width: 30,
          height: 20,
          alive: true,
          type: row < 2 ? 'fighter' : 'bomber'
        });
      }
    }
  }

  function updateGalagaGame() {
    if (!galagaGameRunning || galagaGamePaused) return;
    
    // Move player bullets
    bullets = bullets.filter(bullet => {
      bullet.y -= 8;
      return bullet.y > 0;
    });
    
    // Move enemy bullets
    enemyBullets = enemyBullets.filter(bullet => {
      bullet.y += 4;
      return bullet.y < galagaCanvas.height;
    });
    
    // Move enemies
    enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.x += gameState.enemySpeed;
      }
    });
    
    // Check if enemies hit wall
    const rightmostEnemy = Math.max(...enemies.filter(e => e.alive).map(e => e.x + e.width));
    const leftmostEnemy = Math.min(...enemies.filter(e => e.alive).map(e => e.x));
    
    if (rightmostEnemy >= galagaCanvas.width - 20 || leftmostEnemy <= 20) {
      gameState.enemySpeed = -gameState.enemySpeed;
      enemies.forEach(enemy => {
        if (enemy.alive) {
          enemy.y += 20;
        }
      });
    }
    
    // Enemy shooting
    enemies.forEach(enemy => {
      if (enemy.alive && Math.random() < gameState.enemyShootChance) {
        enemyBullets.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height,
          width: 3,
          height: 10
        });
      }
    });
    
    // Collision detection - bullets vs enemies
    for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = bullets[bulletIndex];
      for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
        const enemy = enemies[enemyIndex];
        if (enemy.alive &&
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y) {
          
          enemy.alive = false;
          bullets.splice(bulletIndex, 1);
          gameState.score += enemy.type === 'fighter' ? 100 : 150;
          
          // Create explosion particles
          for (let i = 0; i < 8; i++) {
            galagaParticles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              dx: (Math.random() - 0.5) * 6,
              dy: (Math.random() - 0.5) * 6,
              life: 30,
              color: enemy.type === 'fighter' ? '#00ff88' : '#ff4444'
            });
          }
          break; // Exit enemy loop after hit
        }
      }
    }
    
    // Collision detection - enemy bullets vs player
    for (let bulletIndex = enemyBullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = enemyBullets[bulletIndex];
      if (bullet.x < player.x + player.width &&
          bullet.x + bullet.width > player.x &&
          bullet.y < player.y + player.height &&
          bullet.y + bullet.height > player.y) {
        
        enemyBullets.splice(bulletIndex, 1);
        gameState.lives--;
        
        // Create explosion particles
        for (let i = 0; i < 12; i++) {
          galagaParticles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            life: 40,
            color: '#ffaa00'
          });
        }
        
        if (gameState.lives <= 0) {
          gameOver();
          return;
        }
        break; // Exit after first hit
      }
    }
    
    // Update particles
    galagaParticles = galagaParticles.filter(particle => {
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.life--;
      return particle.life > 0;
    });
    
    // Check level completion
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0) {
      gameState.level++;
      gameState.enemySpeed += 0.5;
      gameState.enemyShootChance += 0.005;
      createEnemyFormation();
    }
    
    updateGalagaDisplay();
    drawGalagaGame();
  }

  function gameOver() {
    galagaGameRunning = false;
    galagaGamePaused = false;
    
    if (galagaGameLoop) {
      clearInterval(galagaGameLoop);
      galagaGameLoop = null;
    }
    
    updateGalagaGameStatus(`Game Over! Final Score: ${gameState.score}`);
  }

  function drawGalagaGame() {
    if (!galagaCtx) return;
    
    // Clear canvas with space background
    galagaCtx.fillStyle = 'rgba(0, 0, 20, 0.9)';
    galagaCtx.fillRect(0, 0, galagaCanvas.width, galagaCanvas.height);
    
    // Draw stars
    for (let i = 0; i < 50; i++) {
      galagaCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
      galagaCtx.fillRect(i * 12, (i * 7) % galagaCanvas.height, 1, 1);
    }
    
    // Draw player ship
    galagaCtx.fillStyle = '#00d4ff';
    galagaCtx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player ship details
    galagaCtx.fillStyle = '#ffffff';
    galagaCtx.fillRect(player.x + 5, player.y - 5, 30, 5);
    
    // Draw bullets
    galagaCtx.fillStyle = '#00ff88';
    bullets.forEach(bullet => {
      galagaCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw enemy bullets
    galagaCtx.fillStyle = '#ff4444';
    enemyBullets.forEach(bullet => {
      galagaCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
      if (enemy.alive) {
        galagaCtx.fillStyle = enemy.type === 'fighter' ? '#ff00ff' : '#ffaa00';
        galagaCtx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Enemy details
        galagaCtx.fillStyle = '#ffffff';
        galagaCtx.fillRect(enemy.x + 5, enemy.y + 2, 20, 2);
        galagaCtx.fillRect(enemy.x + 10, enemy.y + 8, 10, 2);
      }
    });
    
    // Draw particles
    galagaParticles.forEach(particle => {
      galagaCtx.fillStyle = particle.color;
      galagaCtx.fillRect(particle.x, particle.y, 2, 2);
    });
  }

  function handleGalagaKeyPress(e) {
    if (!galagaGameRunning && e.code === 'Space') {
      e.preventDefault();
      startGalagaGame();
      return;
    }
    
    if (galagaGameRunning && e.code === 'Space') {
      e.preventDefault();
      pauseGalagaGame();
      return;
    }
    
    if (!galagaGameRunning || galagaGamePaused) return;
    
    switch(e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        player.x = Math.max(0, player.x - player.speed);
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        player.x = Math.min(galagaCanvas.width - player.width, player.x + player.speed);
        e.preventDefault();
        break;
      case 'Space':
        e.preventDefault();
        // Shoot bullet
        bullets.push({
          x: player.x + player.width / 2 - 1,
          y: player.y,
          width: 3,
          height: 10
        });
        break;
    }
  }

  function updateGalagaDisplay() {
    document.getElementById('galaga-score').textContent = gameState.score;
    document.getElementById('galaga-lives').textContent = gameState.lives;
    document.getElementById('galaga-level').textContent = gameState.level;
  }

  function updateGalagaGameStatus(message) {
    const statusEl = document.getElementById('galaga-game-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  // Initialize Galaga game if elements exist
  if (document.getElementById('galagaCanvas')) {
    initGalagaGame();
    console.log('Galaga game initialized');
  }

});