// PNG/WebPのヘッダから実寸を読む(依存なしの最小実装)。
// skin:validateが「宣言されたintrinsicSizeと実画像の一致」を検証するために使う。

export type ImageDimensions = { width: number; height: number };

export function readPngDimensions(bytes: Uint8Array): ImageDimensions | null {
  // 8-byte signature + IHDR(長さ4 + "IHDR" + width4 + height4)
  if (bytes.length < 24) {
    return null;
  }
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((b, i) => bytes[i] === b)) {
    return null;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    bytes[12] !== 0x49 ||
    bytes[13] !== 0x48 ||
    bytes[14] !== 0x44 ||
    bytes[15] !== 0x52
  ) {
    return null;
  }
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

export function readWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 30) {
    return null;
  }
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.slice(start, start + length));
  if (ascii(0, 4) !== 'RIFF' || ascii(8, 4) !== 'WEBP') {
    return null;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunk = ascii(12, 4);
  if (chunk === 'VP8X') {
    // canvas size: 24bit little-endian - 1
    const width = 1 + (bytes[24]! | (bytes[25]! << 8) | (bytes[26]! << 16));
    const height = 1 + (bytes[27]! | (bytes[28]! << 8) | (bytes[29]! << 16));
    return { width, height };
  }
  if (chunk === 'VP8 ') {
    // key frame: 3-byte frame tag + 3-byte start code, then 16bit w/h (14bit有効)
    if (bytes.length < 30) {
      return null;
    }
    const width = view.getUint16(26, true) & 0x3fff;
    const height = view.getUint16(28, true) & 0x3fff;
    return { width, height };
  }
  if (chunk === 'VP8L') {
    if (bytes.length < 25 || bytes[20] !== 0x2f) {
      return null;
    }
    const b0 = bytes[21]!;
    const b1 = bytes[22]!;
    const b2 = bytes[23]!;
    const b3 = bytes[24]!;
    const width = 1 + (((b1 & 0x3f) << 8) | b0);
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width, height };
  }
  return null;
}

export function readImageDimensions(
  fileName: string,
  bytes: Uint8Array,
): ImageDimensions | null {
  if (fileName.endsWith('.png')) {
    return readPngDimensions(bytes);
  }
  if (fileName.endsWith('.webp')) {
    return readWebpDimensions(bytes);
  }
  return null; // SVG等はサイズ検証対象外
}
