// Module loader: dynamically load legacy script.js and expose a hook for initial setup
// This keeps the site working while enabling a smoother migration to ESM modules.

const loadLegacyScript = (src = 'script.js') => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
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
    } catch (modErr) {
      console.warn('loader: failed to import some feature modules (ok if legacy in use):', modErr);
    }
  } catch (err) {
    console.error('Failed to load legacy script:', err);
  }
})();
