// Update time/date every second and handle theme toggle
(function(){
  const dtEl = document.getElementById('datetime');
  const btn = document.getElementById('themeBtn');
  const root = document.documentElement;

  function pad(n){ return n.toString().padStart(2,'0'); }

  function updateDateTime(){
    const now = new Date();
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const date = now.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
    dtEl.textContent = `${time} — ${date}`;
  }

  let alt = false;
  function toggleTheme(){
    alt = !alt;
    btn.setAttribute('aria-pressed', String(alt));
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
      btn.style.background = 'linear-gradient(180deg,#9ea8b8,#6f7b8b)';
      btn.style.color = '#fff';
    } else {
      document.documentElement.style.setProperty('--bg','#000000');
      btn.style.background = '';
      btn.style.color = '#111';
    }
  }

  btn.addEventListener('click', toggleTheme);

  updateDateTime();
  setInterval(updateDateTime, 1000);

})();
