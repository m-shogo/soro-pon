import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AssetSlotName } from '../assets/slots';
import type { SkinAssetDefinition, SkinEdgeInsets } from './skinTypes';
import { useSkinAsset } from './useSkin';

// nine-sliceの描画borderWidth(CSS px)。ソースslice(source px)とは独立(P0-5)。
// nineSliceRender指定が最優先。なければsource sliceをpixelDensityで割って導出する。
export function nineSliceRenderWidths(def: SkinAssetDefinition): SkinEdgeInsets {
  const slice = def.nineSlice ?? { top: 16, right: 16, bottom: 16, left: 16 };
  if (def.nineSliceRender) {
    return def.nineSliceRender;
  }
  const density = def.pixelDensity ?? 1;
  return {
    top: Math.round(slice.top / density),
    right: Math.round(slice.right / density),
    bottom: Math.round(slice.bottom / density),
    left: Math.round(slice.left / density),
  };
}

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
      // slice = ソース画像側(source px)、width = 画面描画側(CSS px)。
      // 高密度ソース(pixelDensity 2等)はsliceが大きくwidthが小さくなる。
      const slice = def.nineSlice ?? { top: 16, right: 16, bottom: 16, left: 16 };
      const render = nineSliceRenderWidths(def);
      return {
        ...common,
        borderImageSource: `url("${url}")`,
        borderImageSlice: `${slice.top} ${slice.right} ${slice.bottom} ${slice.left} fill`,
        borderImageWidth: `${render.top}px ${render.right}px ${render.bottom}px ${render.left}px`,
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

/*
 * スキン画像レイヤー(P0-6)。
 * opacity/blendModeを内容要素へ直接かけず、fallback背景の上・内容の下に
 * 独立レイヤーとして敷く。文字・アイコン・focusリング・当たり判定は常に不透明のまま。
 *
 * 前提: ホスト要素は position:relative かつ isolation:isolate(.sp-skin-hostなど)。
 * z-index:-1 はホストのstacking context内で「ホスト背景(fallback)の上、内容の下」になる。
 */
export function SkinLayer({ slot }: { slot: AssetSlotName | null }) {
  const asset = useSkinAsset(slot);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [tooSmall, setTooSmall] = useState(false);

  const min = asset?.def.minRenderSize;
  useEffect(() => {
    if (!min) {
      setTooSmall(false);
      return;
    }
    const el = hostRef.current?.parentElement;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }
    const check = () => {
      const rect = el.getBoundingClientRect();
      setTooSmall(rect.width < min.width || rect.height < min.height);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [min?.width, min?.height, asset?.url]);

  if (!asset) {
    return null;
  }
  // 最小描画サイズ未満では画像を描かない(枠が潰れるくらいならfallbackに落とす)
  const style = tooSmall ? undefined : skinAssetStyle(asset.url, asset.def);
  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="sp-skin-layer"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
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
