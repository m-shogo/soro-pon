// スキンtokenの型付き定義テーブル(P0-1)。
// 名前の正規表現だけに頼らず、全tokenを「structural(スキン変更不可)」か
// 「skinable(種別と範囲で検証して変更可)」に分類する。
// structural tokenはbundled foundations CSSだけが持ち、スキンからは一切上書きできない。

export type SkinTokenKind =
  | 'color' // 単色(hex/rgb/rgba/var/color-mix)
  | 'border' // 幅+スタイル+色のショートハンド
  | 'shadow' // box-shadow列
  | 'gradient' // グラデーション列(色も可)
  | 'radius' // 視覚角丸(範囲制限つき)
  | 'font'; // 許可済みフォントプリセットのみ

export type SkinTokenDefinition = {
  name: string;
  kind: SkinTokenKind;
  /** trueならスキンからの上書きを一切許可しない */
  structural: boolean;
  /** 外部(販売/インストール)スキンが上書きしてよいか */
  externalAllowed: boolean;
};

function skinable(names: string[], kind: SkinTokenKind): SkinTokenDefinition[] {
  return names.map((name) => ({ name, kind, structural: false, externalAllowed: true }));
}

function structural(names: string[]): SkinTokenDefinition[] {
  // kindは検証対象外(スキンから来た時点で拒否される)
  return names.map((name) => ({ name, kind: 'color', structural: true, externalAllowed: false }));
}

const COLOR_TOKENS = [
  '--sp-color-night',
  '--sp-color-night-soft',
  '--sp-color-wood',
  '--sp-color-ink-panel',
  '--sp-color-ink-panel-raised',
  '--sp-color-paper',
  '--sp-color-paper-aged',
  '--sp-color-paper-dark',
  '--sp-color-paper-highlight',
  '--sp-color-ink',
  '--sp-color-ink-soft',
  '--sp-color-cream',
  '--sp-color-cream-dim',
  '--sp-color-lantern-0',
  '--sp-color-lantern-1',
  '--sp-color-lantern-glow',
  '--sp-color-crimson',
  '--sp-color-crimson-bright',
  '--sp-color-danger',
  '--sp-color-success',
  '--sp-color-focus',
  '--sp-color-chip-fallback',
  // semantic contrast tokens(H3)
  '--sp-text-on-primary',
  '--sp-text-on-surface',
  '--sp-text-on-dark',
  '--sp-text-muted',
  '--sp-text-on-category-light',
  '--sp-text-on-category-dark',
  '--sp-focus-ring-color',
  '--sp-focus-ring-halo',
  '--sp-overlay-scrim',
  '--sp-overlay-panel',
];

const BORDER_TOKENS = [
  '--sp-border-ink',
  '--sp-border-paper-edge',
  '--sp-border-lantern',
  '--sp-border-soft',
  '--sp-border-divider-ink',
  '--sp-border-dot',
];

const SHADOW_TOKENS = [
  '--sp-shadow-panel',
  '--sp-shadow-tile',
  '--sp-shadow-tile-raised',
  '--sp-shadow-lantern-soft',
  '--sp-shadow-lantern-strong',
  '--sp-shadow-lantern-pulse',
];

const GRADIENT_TOKENS = [
  '--sp-gradient-shell',
  '--sp-gradient-table',
  '--sp-overlay-table-ink',
  '--sp-overlay-table-light',
  '--sp-panel-sheen',
  '--sp-panel-sheen-soft',
  '--sp-gradient-button-paper',
  '--sp-gradient-button-ink',
  '--sp-gradient-button-primary',
  '--sp-gradient-panel-paper',
  '--sp-gradient-panel-aged',
  '--sp-gradient-panel-ink',
  '--sp-gradient-tile-face',
  '--sp-gradient-tile-back',
];

const RADIUS_TOKENS = ['--sp-radius-sm', '--sp-radius-md', '--sp-radius-lg'];

const FONT_TOKENS = ['--sp-font-family', '--sp-font-family-num'];

// structural: レイアウト/当たり判定/情報密度/重なり/操作時間に関わる値。
// スキンはこれらを変更できない(docs/SKIN-FOUNDATION-HARDENING.md P0-1)。
const STRUCTURAL_TOKENS = [
  '--sp-space-2',
  '--sp-space-4',
  '--sp-space-6',
  '--sp-space-8',
  '--sp-space-12',
  '--sp-space-16',
  '--sp-space-24',
  '--sp-font-xs',
  '--sp-font-sm',
  '--sp-font-md',
  '--sp-font-lg',
  '--sp-font-xl',
  '--sp-line-tight',
  '--sp-line-normal',
  '--sp-line-status',
  '--sp-weight-normal',
  '--sp-weight-medium',
  '--sp-weight-strong',
  '--sp-letter-normal',
  '--sp-letter-status',
  '--sp-text-max',
  '--sp-surface-info',
  '--sp-surface-info-raised',
  '--sp-surface-overlay',
  '--sp-safe-top',
  '--sp-safe-right',
  '--sp-safe-bottom',
  '--sp-safe-left',
  '--sp-z-board',
  '--sp-z-seat',
  '--sp-z-status',
  '--sp-z-hand',
  '--sp-z-actions',
  '--sp-z-message',
  '--sp-z-overlay',
  '--sp-z-modal',
  '--sp-z-rotate-prompt',
  '--sp-touch-min',
  '--sp-touch-primary',
  '--sp-breakpoint-compact',
  '--sp-breakpoint-desktop',
  '--sp-motion-micro',
  '--sp-motion-hover',
  '--sp-motion-modal',
  '--sp-motion-tile',
  '--sp-motion-win',
  '--sp-ease-out',
  '--sp-ease-in-out',
];

export const SKIN_TOKEN_DEFINITIONS: readonly SkinTokenDefinition[] = [
  ...skinable(COLOR_TOKENS, 'color'),
  ...skinable(BORDER_TOKENS, 'border'),
  ...skinable(SHADOW_TOKENS, 'shadow'),
  ...skinable(GRADIENT_TOKENS, 'gradient'),
  ...skinable(RADIUS_TOKENS, 'radius'),
  ...skinable(FONT_TOKENS, 'font'),
  ...structural(STRUCTURAL_TOKENS),
];

export const SKIN_TOKEN_TABLE: ReadonlyMap<string, SkinTokenDefinition> = new Map(
  SKIN_TOKEN_DEFINITIONS.map((def) => [def.name, def]),
);

// ---- 値の種別検証 ----

const COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?|transparent|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d{1,3})\s*)?\)|var\(--sp-[a-z0-9-]+\))$/;

function isColorValue(value: string): boolean {
  return COLOR_PATTERN.test(value.trim());
}

function isBorderValue(value: string): boolean {
  const match = value.trim().match(/^(\d{1,2})px\s+(solid|dashed|dotted)\s+(.+)$/);
  if (!match) {
    return false;
  }
  const width = Number.parseInt(match[1]!, 10);
  return width <= 4 && isColorValue(match[3]!);
}

// 括弧の外側のカンマだけで分割する(rgba()内のカンマを壊さない)
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') {
      depth += 1;
    } else if (ch === ')') {
      depth -= 1;
    }
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

function isShadowValue(value: string): boolean {
  // "none" または「(inset)? 長さ2〜4 + 色」のコンマ列
  if (value.trim() === 'none') {
    return true;
  }
  return splitTopLevel(value).every((segment) => {
    const s = segment.trim();
    const match = s.match(/^(inset\s+)?((-?\d{1,3}px|0)\s+){1,3}(-?\d{1,3}px|0)\s+(.+)$/);
    if (!match) {
      return false;
    }
    return isColorValue(match[5]!);
  });
}

const ALLOWED_VALUE_FUNCTIONS = new Set([
  'linear-gradient',
  'radial-gradient',
  'rgb',
  'rgba',
  'var',
  'color-mix',
]);

function usesOnlyAllowedFunctions(value: string): boolean {
  for (const match of value.matchAll(/([a-zA-Z-]+)\s*\(/g)) {
    if (!ALLOWED_VALUE_FUNCTIONS.has(match[1]!.toLowerCase())) {
      return false;
    }
  }
  return true;
}

function isGradientValue(value: string): boolean {
  // グラデーション列 or 単色。関数は許可リストのみ(url等はparseSkinTokensで先に拒否済みだが多層防御)
  if (!usesOnlyAllowedFunctions(value)) {
    return false;
  }
  return value.trim().length > 0 && value.length <= 400;
}

export const MAX_SKIN_RADIUS_PX = 32;

function isRadiusValue(value: string): boolean {
  const match = value.trim().match(/^(\d{1,2})px$/);
  if (!match) {
    return false;
  }
  return Number.parseInt(match[1]!, 10) <= MAX_SKIN_RADIUS_PX;
}

export type TokenValidationResult = { ok: true } | { ok: false; reason: string };

// token名と値を型付きテーブルで検証する。
// isApprovedFontStackはparseSkinTokens側の既存チェックを利用する前提で、
// ここではfont以外の種別を検証する(fontはkind判定のみ)。
export function validateSkinTokenValue(
  name: string,
  value: string,
  trust: 'official' | 'external',
): TokenValidationResult {
  const def = SKIN_TOKEN_TABLE.get(name);
  if (!def) {
    return { ok: false, reason: `未知のtokenです(allowlist外): ${name}` };
  }
  if (def.structural) {
    return { ok: false, reason: `structural tokenはスキンから変更できません: ${name}` };
  }
  if (trust === 'external' && !def.externalAllowed) {
    return { ok: false, reason: `外部スキンはこのtokenを変更できません: ${name}` };
  }
  switch (def.kind) {
    case 'color': {
      const isColorMix =
        /^color-mix\(/.test(value.trim()) &&
        usesOnlyAllowedFunctions(value) &&
        value.length <= 200;
      if (!isColorValue(value) && !isColorMix) {
        return { ok: false, reason: `color tokenの値が不正です: ${name}` };
      }
      return { ok: true };
    }
    case 'border':
      if (!isBorderValue(value)) {
        return { ok: false, reason: `border tokenの値が不正です: ${name}` };
      }
      return { ok: true };
    case 'shadow':
      if (!isShadowValue(value)) {
        return { ok: false, reason: `shadow tokenの値が不正です: ${name}` };
      }
      return { ok: true };
    case 'gradient':
      if (!isGradientValue(value)) {
        return { ok: false, reason: `gradient tokenの値が不正です: ${name}` };
      }
      return { ok: true };
    case 'radius':
      if (!isRadiusValue(value)) {
        return {
          ok: false,
          reason: `radius tokenは0〜${MAX_SKIN_RADIUS_PX}pxのpx値のみです: ${name}`,
        };
      }
      return { ok: true };
    case 'font':
      // 許可済みスタック照合はparseSkinTokens側(isApprovedFontStack)で行う
      return { ok: true };
  }
}
