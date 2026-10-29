// Génère les icônes PNG de l'appli (sans dépendance) : node tools/make-icons.mjs
// Le dessin reprend le cadran : cercle fin, arc blanc et point au bout.

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x1c, 0x1a, 0x4d];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const SS = 4;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const p = pixel((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
        r += p[0]; g += p[1]; b += p[2]; a += p[3];
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      const n = SS * SS;
      raw[o] = r / n; raw[o + 1] = g / n; raw[o + 2] = b / n; raw[o + 3] = a / n;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

// u, v dans [0, 1]. scale < 1 réduit le dessin (zone sûre des icônes « maskable »).
function dialPixel(scale) {
  const R = 0.3 * scale, W = 0.018 * scale, ARC = 0.032 * scale, DOT = 0.05 * scale;
  const startDeg = 270; // 15 minutes restantes, comme sur le cadran
  const dotA = startDeg * Math.PI / 180;
  const dx0 = 0.5 + R * Math.sin(dotA), dy0 = 0.5 - R * Math.cos(dotA);
  return (u, v) => {
    const dx = u - 0.5, dy = v - 0.5;
    const d = Math.hypot(dx, dy);
    let a = Math.atan2(dx, -dy) * 180 / Math.PI; if (a < 0) a += 360;
    let col = BG, alpha = 0;
    if (Math.abs(d - R) < W / 2) alpha = 0.3;
    if (d < R) alpha = Math.max(alpha, 0.06);
    if (Math.abs(d - R) < ARC / 2 && a >= startDeg) alpha = 1;
    if (Math.hypot(u - dx0, v - dy0) < DOT) alpha = 1;
    col = BG.map((c) => c + (255 - c) * alpha);
    return [...col, 255];
  };
}

writeFileSync('icons/icon-192.png', png(192, dialPixel(1.25)));
writeFileSync('icons/icon-512.png', png(512, dialPixel(1.25)));
writeFileSync('icons/icon-maskable-512.png', png(512, dialPixel(1)));
writeFileSync('icons/apple-touch-icon.png', png(180, dialPixel(1.1)));
console.log('Icônes générées dans icons/');
