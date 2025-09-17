(function(){
  // Simple quote list
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
  const btn = document.getElementById('newQuoteBtn');

  function rand(){ return Math.floor(Math.random()*quotes.length); }
  function setQuote(i){
    const item = quotes[i];
    quoteEl.textContent = `"${item.q}"`;
    authorEl.textContent = `— ${item.a}`;
  }

  btn.addEventListener('click', ()=> setQuote(rand()));

  // reuse datetime update logic lightly
  const dateEl = document.getElementById('date');
  const nyTimeEl = document.getElementById('time-ny');

  function pad(n){ return n.toString().padStart(2,'0'); }
  function updateDateAndTime(){
    const now = new Date();
    const localDate = now.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
    dateEl.textContent = localDate;
    try{
      const nyFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      });
      nyTimeEl.textContent = nyFormatter.format(now);
    }catch(e){
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nyOffset = -4;
      const ny = new Date(utc + (3600000 * nyOffset));
      const hours = ny.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = ((hours + 11) % 12) + 1;
      nyTimeEl.textContent = `${h12}:${pad(ny.getMinutes())}:${pad(ny.getSeconds())} ${ampm}`;
    }
  }

  // seed
  setQuote(rand());
  updateDateAndTime();
  setInterval(updateDateAndTime, 1000);

})();
