// Feature wrapper for particles: re-exports the legacy init if present
export function init() {
  if (typeof window === 'undefined') return;
  if (window.App && window.App.features && typeof window.App.features.initParticleSystem === 'function') {
    window.App.debug && window.App.debug('particles wrapper: calling legacy init');
    window.App.features.initParticleSystem();
  }
}

// safe auto-register: only touch window if it exists
if (typeof window !== 'undefined') {
  window.App = window.App || {};
  window.App.features = window.App.features || {};
  window.App.features.initParticleSystem = window.App.features.initParticleSystem || (() => {});
}
