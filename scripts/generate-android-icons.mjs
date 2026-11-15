import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, t, data, crc]);
}

function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const rowStart = y * (1 + w * 4);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function blendPixel(buf, w, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= w) return;
  const idx = (y * w + x) * 4;
  const sa = a / 255;
  const da = buf[idx + 3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa === 0) return;
  buf[idx] = Math.round((r * sa + buf[idx] * da * (1 - sa)) / oa);
  buf[idx + 1] = Math.round((g * sa + buf[idx + 1] * da * (1 - sa)) / oa);
  buf[idx + 2] = Math.round((b * sa + buf[idx + 2] * da * (1 - sa)) / oa);
  buf[idx + 3] = Math.round(oa * 255);
}

/**
 * Renders the FoodRescue brand logo onto a PNG buffer.
 * mode: 'square' | 'round' | 'foreground' | 'background' | 'splash'
 */
function renderFoodRescuePNG(width, height, mode) {
  const ss = width <= 256 && height <= 256 ? 2 : 1;
  const W = width * ss;
  const H = height * ss;
  const hi = Buffer.alloc(W * H * 4);

  const minDim = Math.min(W, H);
  const cx = W / 2;
  const cy = H / 2;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;

      // Background alpha & color
      let bgR = 255;
      let bgG = 253;
      let bgB = 242;
      let bgA = 255;

      if (mode === 'foreground') {
        bgA = 0;
      } else if (mode === 'round') {
        const dist = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (dist > minDim * 0.48) bgA = 0;
      } else if (mode === 'square') {
        const nx = ((x + 0.5) / W) * 120;
        const ny = ((y + 0.5) / H) * 120;
        const rx = 24;
        const dx = Math.max(rx - nx, 0, nx - (120 - rx));
        const dy = Math.max(rx - ny, 0, ny - (120 - rx));
        if (dx * dx + dy * dy > rx * rx) bgA = 0;
      }

      hi[idx] = bgR;
      hi[idx + 1] = bgG;
      hi[idx + 2] = bgB;
      hi[idx + 3] = bgA;

      if (mode === 'background') continue;

      // Normalize to 0..120 icon coordinate space centered on (cx, cy)
      const scaleFactor =
        mode === 'foreground' ? 0.72 : mode === 'splash' ? 0.42 : 0.94;
      const logoSize = minDim * scaleFactor;
      const ox = 60 + ((x + 0.5 - cx) / logoSize) * 120;
      const oy = 60 + ((y + 0.5 - cy) / logoSize) * 120;

      if (ox < 0 || ox > 120 || oy < 0 || oy > 120) continue;

      // Soft mint aura circle
      if (Math.hypot(ox - 60, oy - 60) <= 52) {
        blendPixel(hi, W, x, y, 220, 252, 231, 255);
      }

      // Left sprouting leaf
      {
        const lx = ox - 47;
        const ly = oy - 34;
        const rx1 = lx * Math.cos(-0.65) - ly * Math.sin(-0.65);
        const ry1 = lx * Math.sin(-0.65) + ly * Math.cos(-0.65);
        if ((rx1 * rx1) / (15 * 15) + (ry1 * ry1) / (7 * 7) <= 1) {
          blendPixel(hi, W, x, y, 139, 195, 74, 255);
        }
      }

      // Right sprouting leaf
      {
        const lx = ox - 73;
        const ly = oy - 34;
        const rx1 = lx * Math.cos(0.65) - ly * Math.sin(0.65);
        const ry1 = lx * Math.sin(0.65) + ly * Math.cos(0.65);
        if ((rx1 * rx1) / (16 * 16) + (ry1 * ry1) / (7.5 * 7.5) <= 1) {
          blendPixel(hi, W, x, y, 76, 175, 80, 255);
        }
      }

      // Center sprout leaf
      {
        const lx = ox - 60;
        const ly = oy - 35;
        if ((lx * lx) / (4.5 * 4.5) + (ly * ly) / (13 * 13) <= 1) {
          blendPixel(hi, W, x, y, 46, 125, 50, 255);
        }
      }

      // Golden nourishment mound
      {
        const gx = ox - 60;
        const gy = oy - 54;
        if ((gx * gx) / (28 * 28) + (gy * gy) / (9 * 9) <= 1) {
          blendPixel(hi, W, x, y, 245, 166, 35, 255);
        }
        if ((gx * gx) / (22 * 22) + ((oy - 53) * (oy - 53)) / (5 * 5) <= 1) {
          blendPixel(hi, W, x, y, 247, 185, 68, 255);
        }
        if (
          Math.hypot(ox - 48, oy - 53) <= 2.4 ||
          Math.hypot(ox - 68, oy - 53) <= 2.4 ||
          Math.hypot(ox - 58, oy - 51.5) <= 2.2
        ) {
          blendPixel(hi, W, x, y, 255, 224, 130, 255);
        }
      }

      // Green bowl body
      if (oy >= 54 && oy <= 89) {
        const bx = ox - 60;
        const by = oy - 54;
        if ((bx * bx) / (36 * 36) + (by * by) / (34 * 34) <= 1) {
          const t = (ox - 24) / 72;
          const rB = Math.round(8 - t * 3);
          const gB = Math.round(138 - t * 42);
          const bB = Math.round(45 - t * 18);
          blendPixel(hi, W, x, y, rB, gB, bB, 255);
        }
      }

      // Bowl rim highlight
      if (((ox - 60) * (ox - 60)) / (36 * 36) + ((oy - 54.5) * (oy - 54.5)) / (3.2 * 3.2) <= 1) {
        blendPixel(hi, W, x, y, 10, 143, 48, 255);
      }

      // Bowl base foot
      if (oy >= 86 && oy <= 91 && Math.abs(ox - 60) <= 12) {
        blendPixel(hi, W, x, y, 6, 95, 32, 255);
      }
    }
  }

  if (ss === 1) {
    return encodePNG(width, height, hi);
  }

  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < ss; dy++) {
        for (let dx = 0; dx < ss; dx++) {
          const idx = ((y * ss + dy) * W + (x * ss + dx)) * 4;
          r += hi[idx];
          g += hi[idx + 1];
          b += hi[idx + 2];
          a += hi[idx + 3];
        }
      }
      const oidx = (y * width + x) * 4;
      const n = ss * ss;
      out[oidx] = Math.round(r / n);
      out[oidx + 1] = Math.round(g / n);
      out[oidx + 2] = Math.round(b / n);
      out[oidx + 3] = Math.round(a / n);
    }
  }
  return encodePNG(width, height, out);
}

const resDir = path.resolve(process.argv[2] || 'android/app/src/main/res');

if (!fs.existsSync(resDir)) {
  console.error(`Android res directory not found: ${resDir}`);
  process.exit(1);
}

// Remove leftover default Capacitor vector icon drawables if present
for (const oldFile of [
  path.join(resDir, 'drawable-v24', 'ic_launcher_foreground.xml'),
  path.join(resDir, 'drawable', 'ic_launcher_background.xml'),
]) {
  if (fs.existsSync(oldFile)) {
    fs.unlinkSync(oldFile);
    console.log(`Removed default template icon: ${oldFile}`);
  }
}

const densities = [
  { folder: 'mipmap-mdpi', launcher: 48, foreground: 108 },
  { folder: 'mipmap-hdpi', launcher: 72, foreground: 162 },
  { folder: 'mipmap-xhdpi', launcher: 96, foreground: 216 },
  { folder: 'mipmap-xxhdpi', launcher: 144, foreground: 324 },
  { folder: 'mipmap-xxxhdpi', launcher: 192, foreground: 432 },
];

for (const d of densities) {
  const dir = path.join(resDir, d.folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), renderFoodRescuePNG(d.launcher, d.launcher, 'square'));
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), renderFoodRescuePNG(d.launcher, d.launcher, 'round'));
  fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), renderFoodRescuePNG(d.foreground, d.foreground, 'foreground'));
  fs.writeFileSync(path.join(dir, 'ic_launcher_background.png'), renderFoodRescuePNG(d.foreground, d.foreground, 'background'));
  console.log(`Generated FoodRescue launcher icons in ${d.folder}`);
}

// Adaptive icon XMLs & background color
const valuesDir = path.join(resDir, 'values');
fs.mkdirSync(valuesDir, { recursive: true });
fs.writeFileSync(
  path.join(valuesDir, 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFFDF2</color>\n</resources>\n`
);

const anydpiDir = path.join(resDir, 'mipmap-anydpi-v26');
fs.mkdirSync(anydpiDir, { recursive: true });
const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml);
fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml);

// Replace any Capacitor default splash.png files with FoodRescue splash screen
const splashPng = renderFoodRescuePNG(720, 1280, 'splash');
const entries = fs.readdirSync(resDir, { withFileTypes: true });
for (const entry of entries) {
  if (entry.isDirectory() && entry.name.startsWith('drawable')) {
    const splashPath = path.join(resDir, entry.name, 'splash.png');
    if (fs.existsSync(splashPath)) {
      fs.writeFileSync(splashPath, splashPng);
      console.log(`Updated splash screen in ${entry.name}/splash.png`);
    }
  }
}

console.log('Successfully applied FoodRescue app icon & splash screen to Android project.');
