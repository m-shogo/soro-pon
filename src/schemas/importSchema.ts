// import境界の契約定数。docs/74-strict-import-contract-and-edit-boundary.md が正。
// importはallowlistベース。未知フィールドは保存せず拒否する。

export const IMPORT_LIMITS = {
  maxImportJsonBytes: 512 * 1024,
  warnImportJsonBytes: 256 * 1024,
  maxJsonDepth: 24,
} as const;

// 再帰unsafe keyスキャンで拒否するキー(小文字比較)。
// 共有deck importに例外はない。
export const UNSAFE_IMPORT_KEYS: readonly string[] = [
  'image',
  'images',
  'imageurl',
  'imagebase64',
  'remoteimageurl',
  'localimageid',
  'bloburl',
  'filepath',
  'assetpath',
  'html',
  'innerhtml',
  'style',
  'css',
  'script',
  'scripts',
  'code',
  'eval',
  'function',
  'plugin',
  'plugins',
  'remoteruleurl',
  'url',
  'href',
  'src',
];

// prototype pollution対策キー(完全一致)。
export const PROTOTYPE_POLLUTION_KEYS: readonly string[] = [
  '__proto__',
  'constructor',
  'prototype',
];

export function isUnsafeImportKey(key: string): boolean {
  if (PROTOTYPE_POLLUTION_KEYS.includes(key)) {
    return true;
  }
  return UNSAFE_IMPORT_KEYS.includes(key.toLowerCase());
}
