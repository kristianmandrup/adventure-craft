import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 8080;
const distPath = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  // Normalize URL
  let requestUrl = req.url.split('?')[0];
  
  // Default to index.html for root
  if (requestUrl === '/') {
    requestUrl = '/index.html';
  }

  let filePath = path.join(distPath, requestUrl);
  
  // Security: Prevent directory traversal
  if (!filePath.startsWith(distPath)) {
      res.writeHead(403);
      res.end('403 Forbidden');
      return;
  }

  const extname = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
          // SPA Fallback: serve index.html for non-asset routes (routes without extensions)
          if (!extname) {
               fs.readFile(path.join(distPath, 'index.html'), (err, content) => {
                  if (err) {
                      res.writeHead(500);
                      res.end('500 Internal Server Error: dist/index.html not found. Ensure build finished successfully.');
                  } else {
                      res.writeHead(200, { 'Content-Type': 'text/html' });
                      res.end(content, 'utf-8');
                  }
               });
          } else {
              res.writeHead(404);
              res.end('404 Not Found');
          }
      } else {
          const contentType = mimeTypes[extname] || 'application/octet-stream';
          fs.readFile(filePath, (err, content) => {
              if (err) {
                  res.writeHead(500);
                  res.end('500 Internal Server Error');
              } else {
                  res.writeHead(200, { 'Content-Type': contentType });
                  res.end(content, 'utf-8');
              }
          });
      }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});