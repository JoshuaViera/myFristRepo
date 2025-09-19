export function init() {
  if (typeof window === 'undefined') return;
  if (window.App && window.App.features && typeof window.App.features.initNeuralNetwork === 'function') {
    window.App.debug && window.App.debug('neural wrapper: calling legacy init');
    window.App.features.initNeuralNetwork();
  }
}

if (typeof window !== 'undefined') {
  window.App = window.App || {};
  window.App.features = window.App.features || {};
  window.App.features.initNeuralNetwork = window.App.features.initNeuralNetwork || (() => {});
}
