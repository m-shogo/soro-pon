// nine-slice実証用のcandidate画像を生成する(H5/P0-5)。
// - 対象slotは panel.paper.default / button.primary.background の2つのみ
// - 出力先は generated/candidates/ (finalへは人のレビュー承認後にのみ昇格する)
// - AI画像生成ではなく、スライス破綻が目視できる幾何パターンを機械的に描く
//
// usage: node scripts/generate-nine-slice-proof.mjs

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKINS = join(ROOT, 'public', 'assets', 'ui', 'soro-pon', 'skins');

// ---- 最小PNGエンコーダ(RGBA, filter 0) ----

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) {
    c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- 描画ヘルパ ----

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

function makeCanvas(width, height) {
  return { width, height, data: Buffer.alloc(width * height * 4) };
}

function fillRect(canvas, x0, y0, x1, y1, hex, alpha = 255) {
  const [r, g, b] = hexToRgb(hex);
  for (let y = Math.max(0, y0); y < Math.min(canvas.height, y1); y += 1) {
    for (let x = Math.max(0, x0); x < Math.min(canvas.width, x1); x += 1) {
      const i = (y * canvas.width + x) * 4;
      canvas.data[i] = r;
      canvas.data[i + 1] = g;
      canvas.data[i + 2] = b;
      canvas.data[i + 3] = alpha;
    }
  }
}

function fillDiamond(canvas, cx, cy, radius, hex) {
  const [r, g, b] = hexToRgb(hex);
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if (Math.abs(x - cx) + Math.abs(y - cy) <= radius && x >= 0 && y >= 0 && x < canvas.width && y < canvas.height) {
        const i = (y * canvas.width + x) * 4;
        canvas.data[i] = r;
        canvas.data[i + 1] = g;
        canvas.data[i + 2] = b;
        canvas.data[i + 3] = 255;
      }
    }
  }
}

// スライス破綻が見えるnine-sliceソースを描く。
// - 枠: edge色の帯 + 内側にaccentの細線(伸びても太らないことの確認用)
// - 四隅: diamondマーク(角が伸縮されると変形して見える)
// - 中央: center色 + 中央にaccent diamond(centerはstretchされる想定)
function drawNineSliceSource({ width, height, slice, edge, center, accent, line }) {
  const c = makeCanvas(width, height);
  // 全面center
  fillRect(c, 0, 0, width, height, center);
  // 枠帯(外周からlineWidthまで)
  const band = Math.round(slice * 0.35);
  fillRect(c, 0, 0, width, band, edge);
  fillRect(c, 0, height - band, width, height, edge);
  fillRect(c, 0, 0, band, height, edge);
  fillRect(c, width - band, 0, width, height, edge);
  // 内側細線(slice境界のすぐ内側)
  const lw = Math.max(2, Math.round(slice * 0.12));
  const inset = slice - lw * 2;
  fillRect(c, inset, inset, width - inset, inset + lw, line);
  fillRect(c, inset, height - inset - lw, width - inset, height - inset, line);
  fillRect(c, inset, inset, inset + lw, height - inset, line);
  fillRect(c, width - inset - lw, inset, width - inset, height - inset, line);
  // 四隅マーク(slice領域の中心)
  const r = Math.round(slice * 0.28);
  const m = Math.round(slice / 2);
  for (const [cx, cy] of [
    [m, m],
    [width - m, m],
    [m, height - m],
    [width - m, height - m],
  ]) {
    fillDiamond(c, cx, cy, r, accent);
  }
  // 中央マーク(centerタイルの目印)
  fillDiamond(c, Math.round(width / 2), Math.round(height / 2), r, accent);
  return c;
}

// ---- 生成対象(candidates。finalには置かない) ----

const TARGETS = [
  {
    skin: 'yorunoshirube',
    file: 'proof-panel-paper-2x.png',
    // panel.paper.default: 契約1x 384x256/slice24 の2x密度候補
    spec: { width: 768, height: 512, slice: 48, edge: '#241a10', center: '#d9c9a6', accent: '#e8a23c', line: '#9c3020' },
  },
  {
    skin: 'yorunoshirube',
    file: 'proof-button-primary-2x.png',
    // button.primary.background: 契約1x 240x72/slice16 の2x密度候補
    spec: { width: 480, height: 144, slice: 32, edge: '#4a1410', center: '#7c2018', accent: '#e8a23c', line: '#f4ead2' },
  },
  {
    skin: 'cute-pop',
    file: 'proof-panel-paper-2x.png',
    spec: { width: 768, height: 512, slice: 48, edge: '#55402f', center: '#ffffff', accent: '#ffb347', line: '#cf4166' },
  },
  {
    skin: 'cute-pop',
    file: 'proof-button-primary-2x.png',
    spec: { width: 480, height: 144, slice: 32, edge: '#8a1f3d', center: '#c22f57', accent: '#ffb347', line: '#ffffff' },
  },
];

for (const target of TARGETS) {
  const canvas = drawNineSliceSource(target.spec);
  const png = encodePng(canvas.width, canvas.height, canvas.data);
  const dir = join(SKINS, target.skin, 'generated', 'candidates');
  mkdirSync(dir, { recursive: true });
  const path = join(dir, target.file);
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}
