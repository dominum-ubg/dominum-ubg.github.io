// Old Script Of Dominum UBG (Laggy Verison)
const grid = document.getElementById('gameGrid');
const overlay = document.getElementById('viewerOverlay');
const frame = document.getElementById('viewerFrame');
const closeBtn = document.getElementById('closeBtn');
const newTabBtn = document.getElementById('newTabBtn');
const status = document.getElementById('status');
const searchBox = document.getElementById('searchBox');
const gameCountEl = document.getElementById('gameCount');
const viewerTitle = document.getElementById('viewerTitle');

let games = [];
let currentGameId = null;

function createCard(game){
  const card = document.createElement('div');
  card.className = 'card';
  card.tabIndex = 0;

  const img = document.createElement('img');
  img.src = `https://cdn.jsdelivr.net/gh/dominum-ubg/game-covers@main/${game.id}.png`;
  img.alt = game.name + ' cover';
  img.onerror = ()=>{ img.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" font-size="20" fill="#fff" dominant-baseline="middle" text-anchor="middle">No cover</text></svg>'; };

  const title = document.createElement('h3');
  title.textContent = game.name;

  card.appendChild(img);
  card.appendChild(title);

  card.onclick = () => openGame(game.id, game.name);
  card.onkeypress = e => { if(e.key==='Enter') openGame(game.id, game.name); };

  return card;
}

async function loadGames(){
  status.style.display = 'block';
  status.textContent = 'Loading games...';
  try{
    const res = await fetch('https://cdn.jsdelivr.net/gh/dominum-ubg/assets@main/games.json', {cache:'no-store'});
    if(!res.ok) throw new Error('Failed to fetch games');
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error('Invalid JSON');
    games = data;
    grid.innerHTML = '';
    games.forEach(g => grid.appendChild(createCard(g)));
    gameCountEl.textContent = `Games: ${games.length}`;
    status.style.display = 'none';
    const params = new URLSearchParams(location.search);
    const openId = params.get('id');
    if(openId) openGame(openId, (games.find(x=>x.id===openId)||{}).name || openId);
  } catch(err){
    console.error(err);
    status.style.display = 'block';
    status.textContent = 'Failed to load games.';
    games = [];
    grid.innerHTML = '';
    gameCountEl.textContent = 'Games: 0';
  }
}

searchBox.addEventListener('input', ()=>{
  const q = searchBox.value.toLowerCase().trim();
  let visible = 0;
  Array.from(grid.children).forEach(card=>{
    const show = card.textContent.toLowerCase().includes(q);
    card.style.display = show?'':'none';
    if(show) visible++;
  });
  gameCountEl.textContent = `Games: ${visible}`;
});

async function openGame(id,name){
  overlay.style.display = 'flex';
  viewerTitle.textContent = name || id;
  currentGameId = id;
  try{
    const res = await fetch(`https://cdn.jsdelivr.net/gh/dominum-ubg/games@main/${id}.html`);
    const html = await res.text();
    const doc = frame.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    const url = new URL(location.href);
    url.searchParams.set('id', id);
    history.replaceState({},'',url.toString());
  }catch(err){
    console.error(err);
  }
}

closeBtn.onclick = () => {
  overlay.style.display = 'none';
  currentGameId = null;
  frame.src='about:blank';
  const url = new URL(location.href);
  url.searchParams.delete('id');
  history.replaceState({},'',url.toString());
}

newTabBtn.onclick = () => {
  if(!currentGameId) return;
  const win = window.open('about:blank','_blank');
  fetch(`https://cdn.jsdelivr.net/gh/dominum-ubg/games@main/${currentGameId}.html`)
    .then(r=>r.text())
    .then(html=>{ win.document.open(); win.document.write(html); win.document.close(); });
}

loadGames();
