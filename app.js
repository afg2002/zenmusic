const $ = s => document.querySelector(s);
const grid = $('#station-grid'), status = $('#status');
let results = [], current = null, view = 'discover', requestId = 0, timer;
let favorites = [];
try { favorites = JSON.parse(localStorage.getItem('zenmusic-songs') || '[]'); if (!Array.isArray(favorites)) favorites = []; } catch { favorites = []; }
const safe = v => String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid = s => s && /^[\w-]{11}$/.test(s.videoId || '') && typeof s.title === 'string';
const saved = s => favorites.some(f => f.videoId === s.videoId);
function save() { try { localStorage.setItem('zenmusic-songs', JSON.stringify(favorites)); } catch {} $('#fav-count').textContent = favorites.length; }
function toggle(s) { favorites = saved(s) ? favorites.filter(f => f.videoId !== s.videoId) : [...favorites, s]; save(); render(); $('#player-favorite').textContent = current && saved(current) ? '♥' : '♡'; }
function render() {
 const q = $('#search').value.trim().toLowerCase();
 const list = (view === 'favorites' ? favorites.filter(s => (s.title + ' ' + s.author).toLowerCase().includes(q)) : results).filter(valid);
 grid.innerHTML = ''; $('#result-count').textContent = `${list.length} SONGS`;
 if (list.length) status.textContent = ''; else if (view === 'favorites') status.textContent = q ? 'No favorites match your search.' : 'Your favorites live here. Tap the heart on a song to save it.';
 list.forEach(s => {
  const card = document.createElement('article'); card.className = 'station-card';
  const duration = Number(s.lengthSeconds); const time = duration > 0 ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2,'0')}` : 'Video';
  card.innerHTML = `<div class="cover" style="background:#526e70"><img src="https://i.ytimg.com/vi/${safe(s.videoId)}/hqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer"><span class="cover-label">${safe(time)}</span><button class="cover-play" aria-label="Play ${safe(s.title)}">▶</button></div><div class="card-info"><div class="card-title-row"><span class="card-title" title="${safe(s.title)}">${safe(s.title)}</span><button class="favorite ${saved(s) ? 'saved' : ''}" aria-label="${saved(s) ? 'Remove from' : 'Add to'} favorites">${saved(s) ? '♥' : '♡'}</button></div><div class="card-meta">${safe(s.author || 'YouTube')}</div></div>`;
  card.querySelector('.cover-play').onclick = () => play(s); card.querySelector('.favorite').onclick = () => toggle(s); grid.append(card);
 });
}
async function search(query) {
 if (view !== 'discover') return render();
 const id = ++requestId; status.textContent = 'Finding music for you...'; grid.innerHTML = '';
 try {
  const response = await fetch('/api/stations?' + new URLSearchParams({q: query || 'music'}));
  if (!response.ok) throw new Error('Search unavailable');
  const data = await response.json(); if (id !== requestId || view !== 'discover') return;
  results = Array.isArray(data) ? data : []; render(); if (!results.filter(valid).length) status.textContent = 'No songs found. Try a different search.';
 } catch { if (id === requestId && view === 'discover') { results = []; render(); status.textContent = 'Search is temporarily unavailable. The Invidious provider may be offline; please try again later.'; } }
}
function play(s) {
 current = s; $('#player-name').textContent = s.title; $('#player-meta').textContent = s.author || 'YouTube';
 $('#player-art').textContent = '♫'; $('#player-favorite').textContent = saved(s) ? '♥' : '♡';
 $('#play').disabled = $('#stop').disabled = $('#player-favorite').disabled = false;
 const frame = document.createElement('iframe'); frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(s.videoId)}?autoplay=1&playsinline=1`; frame.title = s.title; frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
 $('#video-container').replaceChildren(frame); $('#video-panel').hidden = false;
}
$('#play').onclick = () => { if (current) $('#video-panel').hidden = false; };
$('#stop').onclick = () => { $('#video-container').replaceChildren(); $('#video-panel').hidden = true; current = null; $('#player-name').textContent = 'Nothing playing yet'; $('#player-meta').textContent = 'Pick a song to start listening'; $('#player-art').textContent = '✳'; $('#play').disabled = $('#stop').disabled = $('#player-favorite').disabled = true; };
$('#close-video').onclick = () => { $('#stop').click(); };
$('#player-favorite').onclick = () => { if (current) toggle(current); };
$('#search').addEventListener('input', () => { clearTimeout(timer); if (view === 'favorites') render(); else timer = setTimeout(() => search($('#search').value.trim()), 400); });
document.querySelectorAll('.chip').forEach(button => button.onclick = () => { document.querySelectorAll('.chip').forEach(b => b.classList.toggle('active', b === button)); $('#search').value = ''; search(button.dataset.query); });
document.querySelectorAll('.nav-item').forEach(button => button.onclick = () => { view = button.dataset.view; requestId++; document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b === button)); $('#breadcrumb').textContent = view === 'discover' ? 'DISCOVER' : 'YOUR FAVORITES'; $('#section-title').innerHTML = view === 'discover' ? 'Find your sound<span>.</span>' : 'Your favorites<span>.</span>'; $('#section-desc').textContent = view === 'discover' ? 'Your next favorite song is just a search away.' : 'Your favorite songs, all in one place.'; $('#list-title').textContent = view === 'discover' ? 'Discover music' : 'Saved songs'; $('#filters').style.display = view === 'discover' ? '' : 'none'; $('#hero').style.display = view === 'discover' ? '' : 'none'; $('#search').value = ''; if (view === 'discover') search('music'); else render(); });
$('#explore').onclick = () => $('.discovery').scrollIntoView({behavior:'smooth'});
document.addEventListener('keydown', e => { if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#search').focus(); } });
save(); search('music');
