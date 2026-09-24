#!/usr/bin/env node
/**
 * JEE ASCENT - zero-dependency static server.
 *
 * Why this exists: the app is built from native ES modules and registers a
 * service worker. Both are blocked on the file:// protocol, so the app needs a
 * real HTTP origin. This server has no npm dependencies - `node server.js` is
 * the entire install step.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, 'public');

const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const PORT = Number(argOf('--port', process.env.PORT || 5173));
const HOST = argOf('--host', '0.0.0.0');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

/** Block path traversal: resolve, then confirm the result is inside ROOT. */
function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const resolved = path.resolve(ROOT, '.' + path.normalize(decoded));
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { 'Content-Type': 'text/plain' });
  }

  let target = safeResolve(req.url === '/' ? '/index.html' : req.url);
  if (!target) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' });

  fs.stat(target, (err, stat) => {
    if (!err && stat.isDirectory()) target = path.join(target, 'index.html');

    fs.readFile(target, (err2, data) => {
      if (err2) {
        // SPA fallback: unknown non-asset routes render the shell so deep links work.
        if (!path.extname(target)) {
          return fs.readFile(path.join(ROOT, 'index.html'), (e3, shell) =>
            e3
              ? send(res, 404, 'Not Found', { 'Content-Type': 'text/plain' })
              : send(res, 200, shell, { 'Content-Type': MIME['.html'] })
          );
        }
        return send(res, 404, 'Not Found', { 'Content-Type': 'text/plain' });
      }
      const type = MIME[path.extname(target).toLowerCase()] || 'application/octet-stream';
      // The service worker must never be cached by the browser or updates stall.
      const swHeaders = target.endsWith('sw.js') ? { 'Service-Worker-Allowed': '/' } : {};
      send(res, 200, req.method === 'HEAD' ? '' : data, { 'Content-Type': type, ...swHeaders });
    });
  });
});

function lanAddress() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const ni of list || []) {
      if (ni.family === 'IPv4' && !ni.internal) return ni.address;
    }
  }
  return null;
}

server.listen(PORT, HOST, () => {
  const lan = lanAddress();
  console.log('');
  console.log('  \u001b[1m\u001b[36mJEE ASCENT\u001b[0m  —  The Aryabhata Protocol');
  console.log('  ' + '─'.repeat(46));
  console.log(`  Local    \u001b[1mhttp://localhost:${PORT}\u001b[0m`);
  if (lan) console.log(`  Network  http://${lan}:${PORT}   (open on your phone)`);
  console.log('  ' + '─'.repeat(46));
  console.log('  Ctrl+C to stop.\n');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is busy. Try:  node server.js --port ${PORT + 1}\n`);
    process.exit(1);
  }
  throw e;
});
