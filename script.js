// Update time/date every second and handle theme toggle
(function(){
  const dateEl = document.getElementById('date');
  const nyTimeEl = document.getElementById('time-ny');
  const btn = document.getElementById('themeBtn');
  const root = document.documentElement;

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

  updateDateAndTime();
  setInterval(updateDateAndTime, 1000);

})();
