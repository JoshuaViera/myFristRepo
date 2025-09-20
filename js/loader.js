// Module loader: dynamically load legacy script.js and expose a hook for initial setup
// This keeps the site working while enabling a smoother migration to ESM modules.

const loadLegacyScript = (src = 'script.js') => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    try {
      const usp = new URLSearchParams(window.location.search);
      const bust = (usp.get('nocache') === '1' || usp.get('debug') === '1');
      s.src = bust ? `${src}?v=${Date.now()}` : src;
    } catch(_) {
      s.src = src;
    }
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
};

(async function() {
  try {
  console.info('loader.js: executing dynamic loader');
    await loadLegacyScript('script.js');
    // toggle debug via query ?debug=1 or set here
    if (new URLSearchParams(window.location.search).get('debug') === '1') {
      if (window.App) window.App.DEBUG = true;
    }
    // small notification for developers
    if (window.App) window.App.debug('loader: legacy script.js loaded');

  // Dynamically import ES module wrappers for each feature so we can migrate incrementally.
    try {
      await import('./features/particles.js');
      await import('./features/neural.js');
      await import('./features/matrix.js');
      await import('./features/snake.js');
      await import('./features/pingpong.js');
      await import('./features/pacman.js');
      if (window.App) {
        window.App.debug && window.App.debug('loader: feature modules imported');
        try {
          const keys = Object.keys(window.App.features || {});
          console.info('loader: App.features keys after import ->', keys);
        } catch (e) {
          console.warn('loader: failed to list App.features', e);
        }
      }
      // Post-import auto-init: ensure games are initialized after modules register
      try {
        const feats = (window.App && window.App.features) || {};
        // Ping Pong
        if (document.getElementById('pingpongCanvas') && typeof feats.initPingPongGame === 'function') {
          if (!window.__pingpongInited) {
            window.__pingpongInited = true;
            try { feats.initPingPongGame(); window.App.debug && window.App.debug('loader: initPingPongGame post-import'); } catch (e) { console.warn('loader: initPingPongGame failed', e); }
          }
        }
        // Pac-Man
        if (document.getElementById('pacmanCanvas') && typeof feats.initPacman === 'function') {
          if (!window.__pacmanInited) {
            window.__pacmanInited = true;
            try { feats.initPacman(); window.App.debug && window.App.debug('loader: initPacman post-import'); } catch (e) { console.warn('loader: initPacman failed', e); }
          }
        }
        // Snake
        if (document.getElementById('snakeCanvas') && typeof feats.initSnakeGame === 'function') {
          if (!window.__snakeInited) {
            window.__snakeInited = true;
            try { feats.initSnakeGame(); window.App.debug && window.App.debug('loader: initSnakeGame post-import'); } catch (e) { console.warn('loader: initSnakeGame failed', e); }
          }
        }
      } catch (e) {
        console.warn('loader: post-import auto-init failed', e);
      }
      // Fallback: attempt TicTacToe init if its board exists and legacy init hasn't run yet
      try {
        if (document.querySelector('.tic-tac-toe-board .cell') && window.App && window.App.features && typeof window.App.features.initTicTacToe === 'function') {
          if (!window.__tttInited) {
            window.__tttInited = true;
            window.App.features.initTicTacToe();
            window.App.debug && window.App.debug('loader: fallback TicTacToe init');
          }
        }
      } catch (e) {
        console.warn('loader: fallback TicTacToe init failed', e);
      }
    } catch (modErr) {
      console.warn('loader: failed to import some feature modules (ok if legacy in use):', modErr);
    }
  } catch (err) {
    console.error('Failed to load legacy script:', err);
  }
})();
