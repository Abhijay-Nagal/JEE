#!/usr/bin/env node
/**
 * Generates the PWA icons with zero dependencies.
 *
 * Node ships zlib, and a PNG is just a few length-prefixed, CRC-checked
 * chunks wrapping a zlib stream, so the encoder below is about sixty lines.
 * That keeps the project at zero npm packages while still producing the real
 * PNG files a web manifest requires.
 *
 * Run with: npm run icons
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'assets', 'icons');
fs.mkdirSync(OUT, { recursive: true });

/* ---------------- PNG encoder ---------------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** @param {Uint8Array} rgba length = w*h*4 */
function encodePNG(rgba, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type: RGBA
  ihdr[10] = 0;   // deflate
  ihdr[11] = 0;   // adaptive filtering
  ihdr[12] = 0;   // no interlace

  // Each scanline is prefixed with its filter byte (0 = none).
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4)
      .copy(raw, y * (w * 4 + 1) + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------------- tiny raster canvas ---------------- */

function canvas(size) {
  const px = new Uint8Array(size * size * 4);

  const set = (x, y, [r, g, b], a = 1) => {
    if (x < 0 || y < 0 || x >= size || y >= size || a <= 0) return;
    const i = (y * size + x) * 4;
    const sa = Math.min(1, a);
    px[i] = Math.round(px[i] * (1 - sa) + r * sa);
    px[i + 1] = Math.round(px[i + 1] * (1 - sa) + g * sa);
    px[i + 2] = Math.round(px[i + 2] * (1 - sa) + b * sa);
    px[i + 3] = Math.max(px[i + 3], Math.round(255 * sa));
  };

  return {
    px,
    /** Diagonal two-stop gradient across the whole square. */
    gradient(c1, c2) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = (x / size) * 0.5 + (y / size) * 0.5;
          set(x, y, [
            c1[0] + (c2[0] - c1[0]) * t,
            c1[1] + (c2[1] - c1[1]) * t,
            c1[2] + (c2[2] - c1[2]) * t
          ], 1);
        }
      }
    },
    /** Anti-aliased rounded rectangle. */
    roundRect(x0, y0, w, h, r, colour, alpha = 1) {
      const x1 = x0 + w, y1 = y0 + h;
      for (let y = Math.floor(y0) - 1; y <= Math.ceil(y1) + 1; y++) {
        for (let x = Math.floor(x0) - 1; x <= Math.ceil(x1) + 1; x++) {
          // distance outside the rounded rect, for a 1px feather
          const dx = Math.max(x0 + r - x, 0, x - (x1 - r));
          const dy = Math.max(y0 + r - y, 0, y - (y1 - r));
          const d = Math.hypot(dx, dy) - r;
          const inX = x >= x0 - 1 && x <= x1 + 1;
          const inY = y >= y0 - 1 && y <= y1 + 1;
          if (!inX || !inY) continue;
          const cover = d <= -0.5 ? 1 : d >= 0.5 ? 0 : 0.5 - d;
          if (cover > 0) set(x, y, colour, cover * alpha);
        }
      }
    },
    circle(cx, cy, rad, colour, alpha = 1) {
      for (let y = Math.floor(cy - rad) - 1; y <= Math.ceil(cy + rad) + 1; y++) {
        for (let x = Math.floor(cx - rad) - 1; x <= Math.ceil(cx + rad) + 1; x++) {
          const d = Math.hypot(x - cx, y - cy) - rad;
          const cover = d <= -0.5 ? 1 : d >= 0.5 ? 0 : 0.5 - d;
          if (cover > 0) set(x, y, colour, cover * alpha);
        }
      }
    }
  };
}

/* ---------------- the mark ---------------- */

const CYAN = [76, 201, 240];
const VIOLET = [178, 141, 255];
const INK = [4, 14, 28];

/**
 * Three ascending bars with a spark above the tallest: a chart, a staircase
 * and a launch, which is about right for this app.
 * @param {number} size
 * @param {number} inset fraction of the canvas kept clear (maskable safe zone)
 */
function drawIcon(size, inset = 0) {
  const c = canvas(size);
  c.gradient(CYAN, VIOLET);

  const pad = size * (0.22 + inset);
  const usable = size - pad * 2;
  const gap = usable * 0.12;
  const bw = (usable - gap * 2) / 3;
  const base = size - pad;
  const heights = [0.42, 0.68, 1.0];

  heights.forEach((hf, i) => {
    const bh = usable * hf * 0.82;
    c.roundRect(pad + i * (bw + gap), base - bh, bw, bh, Math.min(bw * 0.34, size * 0.045), INK, 0.92);
  });

  // spark above the tallest bar
  const lastX = pad + 2 * (bw + gap) + bw / 2;
  c.circle(lastX, base - usable * 0.82 - size * 0.075, size * 0.045, INK, 0.92);

  return c.px;
}

/* ---------------- write ---------------- */

const targets = [
  { file: 'icon-192.png', size: 192, inset: 0 },
  { file: 'icon-512.png', size: 512, inset: 0 },
  // Maskable icons get cropped to a circle on Android: keep the mark inside
  // the middle 80%, which means extra padding.
  { file: 'maskable-512.png', size: 512, inset: 0.07 }
];

for (const t of targets) {
  const png = encodePNG(drawIcon(t.size, t.inset), t.size, t.size);
  fs.writeFileSync(path.join(OUT, t.file), png);
  console.log(`  ${t.file}  ${t.size}×${t.size}  ${(png.length / 1024).toFixed(1)} KB`);
}

/* An SVG version for browsers that prefer it (and for the favicon). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4cc9f0"/>
      <stop offset="1" stop-color="#b28dff"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <g fill="#040e1c" fill-opacity="0.92">
    <rect x="113" y="256" width="86" height="143" rx="26"/>
    <rect x="213" y="169" width="86" height="230" rx="26"/>
    <rect x="313" y="60" width="86" height="339" rx="26"/>
    <circle cx="356" cy="28" r="23"/>
  </g>
</svg>
`;
fs.writeFileSync(path.join(OUT, 'icon.svg'), svg);
console.log('  icon.svg');
