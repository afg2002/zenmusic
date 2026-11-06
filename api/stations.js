// Radio Browser is a community-maintained directory; never forward user headers.
module.exports = async function handler(req, res) {
  const incoming = new URL(req.url, 'http://localhost');
  const query = (incoming.searchParams.get('q') || '').slice(0, 100);
  const tag = (incoming.searchParams.get('tag') || '').slice(0, 50);
  const params = new URLSearchParams({ limit: '60', hidebroken: 'true', order: 'clickcount', reverse: 'true' });
  if (query) params.set('name', query);
  if (tag) params.set('tag', tag);
  try {
    const response = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${params}`, {
      headers: { 'User-Agent': 'ZenMusic/1.0 (public radio player)' }, signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('Directory unavailable');
    const stations = await response.json();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(stations.map(({stationuuid, name, url_resolved, favicon, country, tags, codec, bitrate}) => ({stationuuid, name, url_resolved, favicon, country, tags, codec, bitrate}))));
  } catch {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({error: 'Station directory is temporarily unavailable'}));
  }
};
