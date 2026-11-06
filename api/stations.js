// Search through a configurable Invidious instance. Do not forward client headers.
module.exports = async function handler(req, res) {
  const incoming = new URL(req.url, 'http://localhost');
  const query = (incoming.searchParams.get('q') || 'music').trim().slice(0, 100) || 'music';
  const base = process.env.INVIDIOUS_URL || 'https://yewtu.be';
  try {
    const origin = new URL(base);
    if (origin.protocol !== 'https:') throw new Error('Invalid instance');
    const params = new URLSearchParams({ q: query, type: 'video' });
    const response = await fetch(`${origin.origin}/api/v1/search?${params}`, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'ZenMusic/1.0' } });
    if (!response.ok) throw new Error('Search unavailable');
    const results = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    res.statusCode = 200;
    res.end(JSON.stringify(results.filter(item => item.type === 'video' && /^[\w-]{11}$/.test(item.videoId || '')).map(({videoId, title, author, lengthSeconds}) => ({ videoId, title, author, lengthSeconds }))));
  } catch {
    res.statusCode = 502; res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Search provider unavailable' }));
  }
};
