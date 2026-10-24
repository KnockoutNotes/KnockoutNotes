const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let u = req.url.split('?')[0];
  if (u === '/' || u === '' || u === '/study') u = '/study.html';
  const filePath = path.join(ROOT, u);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + u);
      return;
    }
    const ext = path.extname(filePath);
    const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.json' ? 'application/json' : ext === '.png' ? 'image/png' : 'text/plain';
    res.writeHead(200, {
      'Content-Type': ct,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Knockout Notes Local Preview Server Running!`);
  console.log(`📱 On Android Phone (Same Wi-Fi): http://192.168.1.5:${PORT}/study.html`);
  console.log(`💻 On Local Machine:              http://localhost:${PORT}/study.html`);
  console.log(`======================================================\n`);
});
