const $ = (selector) => document.querySelector(selector);
const audio = $('#audio');
const grid = $('#station-grid');
const status = $('#status');
let stations = [];
let current = null;
let view = 'discover';
let tag = '';
let requestId = 0;
let timer;
let favorites = [];
try { favorites = JSON.parse(localStorage.getItem('zenmusic-favorites') || '[]'); if (!Array.isArray(favorites)) favorites = []; } catch { favorites = []; }
const palettes = ['#576f4e','#826e57','#526e70','#80665d','#59677b','#77794f','#705c72','#546b5c'];
const symbols = ['✳','◒','✺','◉','✴','◌','✽','◐'];
function escapeHTML(value) { return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function validStation(s) { try { const u = new URL(s.url_resolved); return !!s.stationuuid && !!s.name && u.protocol === 'https:'; } catch { return false; } }
function isFavorite(s) { return favorites.some(f => f.stationuuid === s.stationuuid); }
function saveFavorites() { try { localStorage.setItem('zenmusic-favorites', JSON.stringify(favorites)); } catch {} $('#fav-count').textContent = favorites.length; }
function toggleFavorite(station) { favorites = isFavorite(station) ? favorites.filter(s => s.stationuuid !== station.stationuuid) : [...favorites, station]; saveFavorites(); render(); updatePlayer(); }
function render() {
  const query = $('#search').value.trim().toLowerCase();
  const list = (view === 'favorites' ? favorites.filter(s => s.name.toLowerCase().includes(query)) : stations).filter(validStation);
  grid.innerHTML = '';
  $('#result-count').textContent = `${list.length} STATIONS`;
  if (!list.length && view === 'favorites') { status.textContent = query ? 'No favorites match your search.' : 'Your favorites live here. Tap the heart on a station to save it.'; return; }
  if (list.length) status.textContent = '';
  list.forEach((station, index) => {
    const card = document.createElement('article'); card.className = 'station-card';
    const color = palettes[index % palettes.length];
    const symbol = symbols[index % symbols.length];
    const description = [station.country, (station.tags || '').split(',').filter(Boolean).slice(0, 2).join(' · ')].filter(Boolean).join(' / ') || 'Live radio';
    card.innerHTML = `<div class="cover" style="background:${color}"><span class="cover-label">ZEN / RADIO</span><span class="cover-symbol">${symbol}</span><button class="cover-play" aria-label="Play ${escapeHTML(station.name)}">▶</button></div><div class="card-info"><div class="card-title-row"><span class="card-title" title="${escapeHTML(station.name)}">${escapeHTML(station.name)}</span><button class="favorite ${isFavorite(station) ? 'saved' : ''}" aria-label="${isFavorite(station) ? 'Remove from' : 'Add to'} favorites">${isFavorite(station) ? '♥' : '♡'}</button></div><div class="card-meta">${escapeHTML(description)}</div></div>`;
    card.querySelector('.cover-play').addEventListener('click', () => playStation(station, color, symbol));
    card.querySelector('.favorite').addEventListener('click', () => toggleFavorite(station));
    grid.append(card);
  });
}
async function loadStations() {
  if (view !== 'discover') { render(); return; }
  const id = ++requestId;
  status.textContent = 'Finding your next favorite station...'; grid.innerHTML = '';
  try {
    const params = new URLSearchParams(); if ($('#search').value.trim()) params.set('q', $('#search').value.trim()); if (tag) params.set('tag', tag);
    const response = await fetch('/api/stations?' + params); if (!response.ok) throw new Error('Directory unavailable');
    const data = await response.json(); if (id !== requestId || view !== 'discover') return;
    stations = Array.isArray(data) ? data : []; render();
    if (!stations.filter(validStation).length) status.textContent = 'No stations found. Try another search or sound.';
  } catch { if (id === requestId && view === 'discover') { stations = []; render(); status.textContent = 'Could not reach the station directory. Please try again in a moment.'; } }
}
function updatePlayer() { $('#player-favorite').textContent = current && isFavorite(current) ? '♥' : '♡'; $('#player-favorite').style.color = current && isFavorite(current) ? '#c5ef79' : ''; $('#play').textContent = audio.paused ? '▶' : '❚❚'; $('#play').setAttribute('aria-label', audio.paused ? 'Play' : 'Pause'); }
function playStation(station, color, symbol) { current = station; audio.src = station.url_resolved; audio.volume = Number($('#volume').value); $('#player-name').textContent = station.name; $('#player-meta').textContent = `${station.country || 'Worldwide'} · Live radio`; $('#player-art').style.background = color; $('#player-art').textContent = symbol; $('#play').disabled = $('#stop').disabled = $('#player-favorite').disabled = false; audio.play().catch(() => { $('#player-meta').textContent = 'Stream unavailable. Try another station.'; updatePlayer(); }); updatePlayer(); }
audio.addEventListener('play', updatePlayer); audio.addEventListener('pause', updatePlayer); audio.addEventListener('error', () => { if (current) $('#player-meta').textContent = 'Stream unavailable. Try another station.'; });
$('#play').addEventListener('click', () => { if (audio.paused) audio.play().catch(() => { $('#player-meta').textContent = 'Stream unavailable. Try another station.'; }); else audio.pause(); });
$('#stop').addEventListener('click', () => { audio.pause(); audio.removeAttribute('src'); audio.load(); current = null; $('#player-name').textContent = 'Nothing playing yet'; $('#player-meta').textContent = 'Pick a station to start listening'; $('#player-art').textContent = '✳'; $('#play').disabled = $('#stop').disabled = $('#player-favorite').disabled = true; updatePlayer(); });
$('#player-favorite').addEventListener('click', () => { if (current) toggleFavorite(current); });
$('#volume').addEventListener('input', event => audio.volume = Number(event.target.value));
$('#search').addEventListener('input', () => { clearTimeout(timer); if (view === 'favorites') render(); else timer = setTimeout(loadStations, 350); });
document.querySelectorAll('.chip').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.chip').forEach(b => b.classList.remove('active')); button.classList.add('active'); tag = button.dataset.tag; loadStations(); }));
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => { view = button.dataset.view; requestId++; document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b === button)); $('#breadcrumb').textContent = view === 'discover' ? 'DISCOVER' : 'YOUR FAVORITES'; $('#section-title').innerHTML = view === 'discover' ? 'Find your sound<span>.</span>' : 'Your favorites<span>.</span>'; $('#section-desc').textContent = view === 'discover' ? 'A world of music, just a click away.' : 'Your favorite sounds, all in one place.'; $('#list-title').textContent = view === 'discover' ? 'Popular right now' : 'Saved stations'; $('#filters').style.display = view === 'discover' ? '' : 'none'; $('#hero').style.display = view === 'discover' ? '' : 'none'; $('#search').value = ''; if (view === 'discover') loadStations(); else render(); }));
$('#explore').addEventListener('click', () => $('.discovery').scrollIntoView({behavior:'smooth'}));
document.addEventListener('keydown', e => { if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#search').focus(); } });
saveFavorites(); loadStations();
