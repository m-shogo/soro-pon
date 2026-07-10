import type { CSSProperties } from 'react';
import type { AssetSlotName } from '../assets/slots';
import type { SkinAssetDefinition } from './skinTypes';
import { useSkinAsset } from './useSkin';

// renderMode -> CSSの変換はここへ集約する。
// 画面・コンポーネント側でnine-slice等を個別実装してはならない。
// 返るのは「見た目のstyle」のみ。サイズ・当たり判定・レイアウトには関与しない。
export function skinAssetStyle(url: string, def: SkinAssetDefinition): CSSProperties {
  const common: CSSProperties = {
    ...(def.opacity !== undefined ? { opacity: def.opacity } : {}),
    ...(def.blendMode !== undefined
      ? { backgroundBlendMode: def.blendMode as CSSProperties['backgroundBlendMode'] }
      : {}),
  };
  switch (def.renderMode) {
    case 'cover':
      return {
        ...common,
        backgroundImage: `url("${url}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    case 'contain':
      return {
        ...common,
        backgroundImage: `url("${url}")`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    case 'stretch':
      return {
        ...common,
        backgroundImage: `url("${url}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      };
    case 'repeat':
      return {
        ...common,
        backgroundImage: `url("${url}")`,
        backgroundRepeat: 'repeat',
      };
    case 'nine-slice': {
      const slice = def.nineSlice ?? { top: 16, right: 16, bottom: 16, left: 16 };
      return {
        ...common,
        borderImageSource: `url("${url}")`,
        borderImageSlice: `${slice.top} ${slice.right} ${slice.bottom} ${slice.left} fill`,
        borderImageWidth: `${slice.top}px ${slice.right}px ${slice.bottom}px ${slice.left}px`,
        borderImageRepeat: 'stretch',
        borderStyle: 'solid',
        borderColor: 'transparent',
      };
    }
    case 'overlay':
      return {
        ...common,
        backgroundImage: `url("${url}")`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
      };
  }
}

// slotのスキン画像styleを返す。画像がなければundefined(=CSS fallback)。
export function useSkinSurfaceStyle(slot: AssetSlotName | null): CSSProperties | undefined {
  const asset = useSkinAsset(slot);
  if (!asset) {
    return undefined;
  }
  return skinAssetStyle(asset.url, asset.def);
}

// 装飾overlay用の要素。レイアウトに影響せず、操作をブロックしない。
export function SkinOverlay({ slot, className }: { slot: AssetSlotName; className?: string }) {
  const style = useSkinSurfaceStyle(slot);
  if (!style) {
    return null;
  }
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}
    />
  );
}
