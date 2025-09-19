export function init() {
  if (typeof window === 'undefined') return;
  if (window.App && window.App.features && typeof window.App.features.initMatrixRain === 'function') {
    window.App.debug && window.App.debug('matrix wrapper: calling legacy init');
    window.App.features.initMatrixRain();
  }
}

if (typeof window !== 'undefined') {
  window.App = window.App || {};
  window.App.features = window.App.features || {};
  window.App.features.initMatrixRain = window.App.features.initMatrixRain || (() => {});
}
