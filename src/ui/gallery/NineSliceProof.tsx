import type { CSSProperties } from 'react';
import { skinAssetStyle } from '../skins/SkinSurface';
import { useSkin } from '../skins/useSkin';
import type { SkinAssetDefinition } from '../skins/skinTypes';
import { Button } from '../components/Button';
import { PaperPanel } from '../components/PaperPanel';

/*
 * nine-slice実証セクション(H5/P0-5)。Gallery専用。
 * generated/candidates/ の実証画像を、中央レンダラ(skinAssetStyle)で
 * 各サイズ・各状態に貼って破綻がないか目視レビューする。
 * candidatesはmanifest未登録なので、ここだけが唯一のプレビュー経路。
 * 承認されるまでfinal昇格もmanifest登録もしない。
 */

// 2x密度候補: ソースslice(source px)と描画幅(CSS px)を分離した契約
const PANEL_DEF: SkinAssetDefinition = {
  file: 'proof-panel-paper-2x.png',
  status: 'placeholder',
  renderMode: 'nine-slice',
  intrinsicSize: { width: 768, height: 512 },
  pixelDensity: 2,
  nineSlice: { top: 48, right: 48, bottom: 48, left: 48 },
  nineSliceRender: { top: 24, right: 24, bottom: 24, left: 24 },
  minRenderSize: { width: 64, height: 64 },
  contentSafeArea: { top: 24, right: 24, bottom: 24, left: 24 },
};

const BUTTON_DEF: SkinAssetDefinition = {
  file: 'proof-button-primary-2x.png',
  status: 'placeholder',
  renderMode: 'nine-slice',
  intrinsicSize: { width: 480, height: 144 },
  pixelDensity: 2,
  nineSlice: { top: 32, right: 32, bottom: 32, left: 32 },
  nineSliceRender: { top: 16, right: 16, bottom: 16, left: 16 },
  minRenderSize: { width: 72, height: 44 },
  contentSafeArea: { top: 16, right: 16, bottom: 16, left: 16 },
};

function candidateUrl(skinId: string, file: string): string {
  const pkg = skinId === 'cute-pop' ? 'cute-pop' : 'yorunoshirube';
  return `/assets/ui/soro-pon/skins/${pkg}/generated/candidates/${file}`;
}

export function NineSliceProof() {
  const { activeSkinId } = useSkin();
  const panelStyle = skinAssetStyle(candidateUrl(activeSkinId, PANEL_DEF.file!), PANEL_DEF);
  const buttonStyle = skinAssetStyle(candidateUrl(activeSkinId, BUTTON_DEF.file!), BUTTON_DEF);
  const row: CSSProperties = {
    display: 'flex',
    gap: 'var(--sp-space-12)',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  };

  return (
    <>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        candidates画像(2x密度 / source slice 2倍・描画幅は1x)をレビューする。四隅の菱形が変形
        したり内側の細線が太ったらスライス破綻。承認までfinal昇格・manifest登録はしない。
      </p>
      <h3>button.primary.background(min幅 / 通常 / 長文 / 2行 / disabled)</h3>
      <div style={row}>
        <Button variant="primary" style={{ ...buttonStyle, minWidth: '72px' }}>
          進
        </Button>
        <Button variant="primary" style={buttonStyle}>
          対局開始
        </Button>
        <Button variant="primary" style={buttonStyle}>
          とてもとても長い日本語のボタンラベル確認
        </Button>
        <Button variant="primary" style={buttonStyle} subLabel="8枚+この牌であがる(2行目)">
          ロン
        </Button>
        <Button variant="primary" style={buttonStyle} disabled>
          捨てる
        </Button>
      </div>
      <h3>panel.paper.default(最小 / 標準 / 大型 / 長文)</h3>
      <div style={row}>
        <PaperPanel style={{ ...panelStyle, width: 96, minHeight: 64 }}>最小</PaperPanel>
        <PaperPanel style={{ ...panelStyle, width: 240 }} title="標準パネル">
          紙の質感はcenter領域がstretchされる。
        </PaperPanel>
        <PaperPanel style={{ ...panelStyle, width: 420 }} title="大型パネル">
          夜の帳が下りた、記憶の欠片を集める頃。長い本文が入っても枠の太さは変わらず、
          四隅の飾りも変形しないことを確認する。二行目、三行目と本文が続いても
          contentSafeAreaの内側に収まる。
        </PaperPanel>
      </div>
    </>
  );
}
