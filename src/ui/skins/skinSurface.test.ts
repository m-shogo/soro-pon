import { describe, expect, it } from 'vitest';
import { nineSliceRenderWidths, skinAssetStyle } from './SkinSurface';
import type { SkinAssetDefinition } from './skinTypes';
import { validateSkinManifest } from './validateSkinManifest';

// H5/P0-5: source sliceと描画borderWidthの分離、高密度ソース対応

const BASE_DEF: SkinAssetDefinition = {
  file: 'x.png',
  status: 'final',
  renderMode: 'nine-slice',
  nineSlice: { top: 48, right: 48, bottom: 48, left: 48 },
};

describe('nineSliceRenderWidths', () => {
  it('nineSliceRender指定が最優先される', () => {
    const def: SkinAssetDefinition = {
      ...BASE_DEF,
      pixelDensity: 2,
      nineSliceRender: { top: 20, right: 22, bottom: 24, left: 26 },
    };
    expect(nineSliceRenderWidths(def)).toEqual({ top: 20, right: 22, bottom: 24, left: 26 });
  });

  it('未指定ならsource sliceをpixelDensityで割る(2x高密度ソース)', () => {
    expect(nineSliceRenderWidths({ ...BASE_DEF, pixelDensity: 2 })).toEqual({
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
    });
  });

  it('pixelDensity未指定は1x(source slice = 描画幅)', () => {
    expect(nineSliceRenderWidths(BASE_DEF)).toEqual({ top: 48, right: 48, bottom: 48, left: 48 });
  });
});

describe('skinAssetStyle: nine-slice', () => {
  it('sliceはsource px、widthはCSS pxで分離される', () => {
    const style = skinAssetStyle('/x.png', { ...BASE_DEF, pixelDensity: 2 });
    expect(style.borderImageSlice).toBe('48 48 48 48 fill');
    expect(style.borderImageWidth).toBe('24px 24px 24px 24px');
    expect(style.borderImageRepeat).toBe('stretch');
  });
});

describe('manifest schema: 描画契約フィールド', () => {
  const manifest = (slotDef: Record<string, unknown>) => ({
    id: 'base',
    label: 'x',
    version: 1,
    skinContractVersion: 1,
    origin: 'official',
    tokensFile: 'tokens.css',
    slots: { 'panel.paper.default': slotDef },
  });

  const validNineSlice = {
    file: null,
    status: 'placeholder',
    renderMode: 'nine-slice',
    nineSlice: { top: 48, right: 48, bottom: 48, left: 48 },
    nineSliceRender: { top: 24, right: 24, bottom: 24, left: 24 },
    pixelDensity: 2,
    minRenderSize: { width: 64, height: 64 },
  };

  it('nineSliceRender/pixelDensity/minRenderSizeを受理する', () => {
    expect(validateSkinManifest(manifest(validNineSlice)).ok).toBe(true);
  });

  it('pixelDensityの範囲外を拒否する', () => {
    expect(validateSkinManifest(manifest({ ...validNineSlice, pixelDensity: 4 })).ok).toBe(false);
    expect(validateSkinManifest(manifest({ ...validNineSlice, pixelDensity: 0 })).ok).toBe(false);
  });

  it('描画幅の上限(128px)を拒否する', () => {
    const result = validateSkinManifest(
      manifest({
        ...validNineSlice,
        nineSliceRender: { top: 129, right: 24, bottom: 24, left: 24 },
      }),
    );
    expect(result.ok).toBe(false);
  });

  it('nine-slice以外のnineSliceRenderを拒否する', () => {
    const result = validateSkinManifest(
      manifest({
        file: null,
        status: 'placeholder',
        renderMode: 'stretch',
        nineSliceRender: { top: 8, right: 8, bottom: 8, left: 8 },
      }),
    );
    expect(result.ok).toBe(false);
  });
});
