const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const handler = require('./api/stations');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
http.createServer((req,res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/stations') return handler(req,res);
  const file = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(__dirname + path.sep) || !['index.html','style.css','app.js'].includes(path.basename(file))) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(file, (err,data) => { if (err) { res.writeHead(404); return res.end('Not found'); } res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream'}); res.end(data); });
}).listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`ZenMusic running on port ${process.env.PORT || 3000}`));
