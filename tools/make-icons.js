// Genera los iconos PNG de la app sin dependencias: node tools/make-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = buf => { let c = 0xffffffff; for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y, size);
      const i = y * (size * 4 + 1) + 1 + x * 4;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const RED = [227, 53, 13, 255], WHITE = [250, 250, 250, 255], DARK = [34, 34, 40, 255], BG = [255, 210, 63, 255];

// Bola roja/blanca con banda y botón central. `scale` = radio relativo (más pequeño para maskable)
const ball = (scale, bg) => (x, y, s) => {
  const cx = s / 2, cy = s / 2, R = (s / 2) * scale;
  const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
  const band = R * 0.09, outline = R * 0.07;
  if (d > R) return bg;
  if (d > R - outline) return DARK;
  if (d < R * 0.22) return d < R * 0.14 ? WHITE : DARK;
  if (Math.abs(dy) < band) return DARK;
  return dy < 0 ? RED : WHITE;
};

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon-192.png'), png(192, ball(0.92, BG)));
fs.writeFileSync(path.join(out, 'icon-512.png'), png(512, ball(0.92, BG)));
fs.writeFileSync(path.join(out, 'icon-512-maskable.png'), png(512, ball(0.62, BG)));
console.log('Iconos generados en', out);
