// Cute Pop 本命候補アセットの生成(asset request 006)。
// - 出力先は generated/candidates/ のみ(final昇格は人のレビュー後)
// - SDF(符号付き距離)ベースのアンチエイリアスで、フラットでクリーンな
//   丸角カード面を決定的に描く。テクスチャ/光沢/文字は入れない。
//
// usage: node scripts/generate-cute-pop-candidates.mjs

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'ui', 'soro-pon', 'skins', 'cute-pop', 'generated', 'candidates');

// ---- PNGエンコーダ(RGBA, filter 0) ----

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
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- 色/SDFユーティリティ ----

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

// 丸角矩形の符号付き距離(中心originの半サイズhx,hy・角丸r)
function roundedRectSdf(px, py, hx, hy, r) {
  const qx = Math.abs(px) - (hx - r);
  const qy = Math.abs(py) - (hy - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/*
 * Cute Popカード面の描画:
 *  - fill: 白ベース(下辺内側に控えめなシェード帯で厚みを出す)
 *  - border: 暖色ベージュの細線
 *  - 角丸の外側は完全透明(nine-slice cornerを背景へ自然に載せる)
 *  - 四隅に控えめな装飾ドット(corner領域内=伸縮されない)
 */
function drawCard({ width, height, radius, borderWidth, border, fill, fillBottom, shadeBand, dot }) {
  const data = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const hx = width / 2 - 1;
  const hy = height / 2 - 1;
  const borderRgb = hexToRgb(border);
  const fillRgb = hexToRgb(fill);
  const fillBottomRgb = hexToRgb(fillBottom);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = x + 0.5 - cx;
      const py = y + 0.5 - cy;
      const d = roundedRectSdf(px, py, hx, hy, radius);
      const coverage = clamp01(0.5 - d); // 外形AA(1px)
      if (coverage <= 0) {
        continue;
      }
      // 内側形状(borderの内縁)
      const dInner = d + borderWidth;
      const innerCoverage = clamp01(0.5 - dInner);

      // fill: 縦方向にごくわずかに暖色へ(面の成形。派手なグラデにしない)
      const t = y / height;
      let r = mix(fillRgb[0], fillBottomRgb[0], t);
      let g = mix(fillRgb[1], fillBottomRgb[1], t);
      let b = mix(fillRgb[2], fillBottomRgb[2], t);

      // 下辺内側のシェード帯(押せる厚み)。border内縁から帯幅分だけ。
      const bottomInnerEdge = hy - borderWidth;
      const distFromBottom = bottomInnerEdge - py; // 内側下端からの距離
      if (distFromBottom >= 0 && distFromBottom < shadeBand.width) {
        const s = 1 - distFromBottom / shadeBand.width;
        const shadeRgb = hexToRgb(shadeBand.color);
        const amount = shadeBand.strength * s * s;
        r = mix(r, shadeRgb[0], amount);
        g = mix(g, shadeRgb[1], amount);
        b = mix(b, shadeRgb[2], amount);
      }

      // border合成(内側coverageが低いほどborder色)
      r = mix(borderRgb[0], r, innerCoverage);
      g = mix(borderRgb[1], g, innerCoverage);
      b = mix(borderRgb[2], b, innerCoverage);

      const i = (y * width + x) * 4;
      data[i] = Math.round(r);
      data[i + 1] = Math.round(g);
      data[i + 2] = Math.round(b);
      data[i + 3] = Math.round(coverage * 255);
    }
  }

  // 四隅の装飾ドット(corner安全域内・控えめ)
  if (dot) {
    const dotRgb = hexToRgb(dot.color);
    const inset = dot.inset;
    for (const [dcx, dcy] of [
      [inset, inset],
      [width - inset, inset],
      [inset, height - inset],
      [width - inset, height - inset],
    ]) {
      for (let y = Math.floor(dcy - dot.radius - 1); y <= dcy + dot.radius + 1; y += 1) {
        for (let x = Math.floor(dcx - dot.radius - 1); x <= dcx + dot.radius + 1; x += 1) {
          if (x < 0 || y < 0 || x >= width || y >= height) {
            continue;
          }
          const dd = Math.hypot(x + 0.5 - dcx, y + 0.5 - dcy) - dot.radius;
          const cov = clamp01(0.5 - dd);
          if (cov <= 0) {
            continue;
          }
          const i = (y * width + x) * 4;
          if (data[i + 3] === 0) {
            continue; // カード外には描かない
          }
          data[i] = Math.round(mix(data[i], dotRgb[0], cov));
          data[i + 1] = Math.round(mix(data[i + 1], dotRgb[1], cov));
          data[i + 2] = Math.round(mix(data[i + 2], dotRgb[2], cov));
        }
      }
    }
  }

  return data;
}

// ---- 生成対象(request 006 / 2x密度) ----

const TARGETS = [
  {
    file: 'button-secondary-2x.png',
    // 240x72 CSS @2x。radius 14CSS=28src、border 1.5CSS=3src
    spec: {
      width: 480,
      height: 144,
      radius: 28,
      borderWidth: 3,
      border: '#e6cdae',
      fill: '#ffffff',
      fillBottom: '#fff6e9',
      shadeBand: { width: 10, color: '#f3dfc4', strength: 0.55 },
      dot: null,
    },
  },
  {
    file: 'panel-paper-2x.png',
    // 384x256 CSS @2x。radius 20CSS=40src、border 1.5CSS=3src
    // panel.paper.defaultはMatchSetup/Modal等でも共有される基礎面のため、
    // Cute Pop固有の装飾(角ドット等)は持たせない。装飾は上位レイヤー
    // (badge/見出し/アイコン/背景装飾)で表現する(final承認時の判断)。
    spec: {
      width: 768,
      height: 512,
      radius: 40,
      borderWidth: 3,
      border: '#eed9bd',
      fill: '#ffffff',
      fillBottom: '#fffaf1',
      shadeBand: { width: 8, color: '#f6e8d2', strength: 0.4 },
      dot: null,
    },
  },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const target of TARGETS) {
  const rgba = drawCard(target.spec);
  const png = encodePng(target.spec.width, target.spec.height, rgba);
  const path = join(OUT_DIR, target.file);
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}
