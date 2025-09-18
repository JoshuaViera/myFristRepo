// Consolidated JavaScript for time/date, theme toggle, and quote functionality
(function(){
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
  }

  // Initialize quote functionality if elements exist
  if (quoteEl && authorEl) {
    setQuote(getRandomQuoteIndex());
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
  let scores = {
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
    if (scoreXEl) scoreXEl.textContent = scores.X;
    if (scoreOEl) scoreOEl.textContent = scores.O;
    if (scoreTieEl) scoreTieEl.textContent = scores.tie;
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

  function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.dataset.index);

    if (gameBoard[index] !== '' || !gameActive) {
      return;
    }

    // Update board
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    cell.disabled = true;

    // Check for winner
    const winner = checkWinner();
    
    if (winner) {
      gameActive = false;
      if (winner === 'tie') {
        updateGameStatus("It's a tie!");
        scores.tie++;
      } else {
        updateGameStatus(`Player ${winner} wins!`);
        scores[winner]++;
      }
      updateScore();
      showResetButton();
    } else {
      // Switch players
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateGameStatus(`Player ${currentPlayer}'s turn`);
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
    
    updateGameStatus("Player X's turn");
    hideResetButton();
  }

  function resetScore() {
    scores = { X: 0, O: 0, tie: 0 };
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
    updateScore();
    updateGameStatus("Player X's turn");
    hideResetButton(); // Ensure reset button is hidden at start
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
    document.getElementById('changeSpeed')?.addEventListener('click', changeMatrixSpeed);
    
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
    
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    matrixCtx.fillStyle = matrixColors[currentColorIndex];
    
    matrixChars.forEach((char, index) => {
      const x = index * 15;
      
      matrixCtx.fillText(char.char, x, char.y);
      
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

  function changeMatrixSpeed() {
    matrixChars.forEach(char => {
      char.speed = Math.random() * 3 + 0.5;
    });
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

})();