import type { CSSProperties, ReactNode } from 'react';
import { skinAssetStyle } from '../skins/SkinSurface';
import { useSkin } from '../skins/useSkin';
import type { SkinAssetDefinition } from '../skins/skinTypes';
import { Button } from '../components/Button';
import { TileCard } from '../components/TileCard';

/*
 * R1候補(request 008/009)のレビューセクション。Gallery専用。
 * candidatesはproduction manifestへ未登録なので、実コンポーネントの
 * slot解決(useSkinAsset)では読み込まれない。ここではskinAssetStyle()を
 * 直接使い、実TileCard/Buttonのstyle propへ注入してレビューする
 * (実配信経路とは独立。request 007のBadgeInfoBackgroundReviewと同方式)。
 * 人間承認されるまでfinal昇格もmanifest登録もしない。
 * 承認・昇格後にこのセクションは削除する。
 */

type Candidate = { id: 'a' | 'b' | 'c'; label: string; file: string };

const TILE_FACE_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 無地白+クリーム細フレーム', file: 'tile-face-base-candidate-a.png' },
  { id: 'b', label: 'B: 二重線+四隅ドット', file: 'tile-face-base-candidate-b.png' },
  { id: 'c', label: 'C: スカラップ(波形)フレーム', file: 'tile-face-base-candidate-c.png' },
];

const TILE_BACK_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: パステル菱形格子', file: 'tile-back-base-candidate-a.png' },
  { id: 'b', label: 'B: 水玉', file: 'tile-back-base-candidate-b.png' },
  { id: 'c', label: 'C: 斜めストライプ(ピンク)', file: 'tile-back-base-candidate-c.png' },
];

type ButtonCandidate = Candidate & { height: number };

// 生成pillのアスペクトへcanvasを合わせている(9-slice領域を実面で満たすため)。
// 採用候補のintrinsicSizeはskin.json登録時にこの実寸を使う。
const BUTTON_CANDIDATES: ButtonCandidate[] = [
  {
    id: 'a',
    label: 'A: フラット濃ピンク(480x96)',
    file: 'button-primary-background-candidate-a.png',
    height: 96,
  },
  {
    id: 'b',
    label: 'B: 上半分ソフトトーン(480x104)',
    file: 'button-primary-background-candidate-b.png',
    height: 104,
  },
  {
    id: 'c',
    label: 'C: クリーム内側ライン(480x128)',
    file: 'button-primary-background-candidate-c.png',
    height: 128,
  },
];

// slot契約(base manifest)と同一ジオメトリ。tileは600x800 @2xのstretch。
const TILE_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'stretch',
  intrinsicSize: { width: 300, height: 400 },
  pixelDensity: 2,
  transparent: true,
};

// button.primary.background: 480x(候補ごと) @2x、slice32/render16(finalのsecondaryと同系)
function buttonDef(height: number): SkinAssetDefinition {
  return {
    file: null,
    status: 'placeholder',
    renderMode: 'nine-slice',
    intrinsicSize: { width: 480, height },
    pixelDensity: 2,
    transparent: true,
    nineSlice: { top: 32, right: 32, bottom: 32, left: 32 },
    nineSliceRender: { top: 16, right: 16, bottom: 16, left: 16 },
    contentSafeArea: { top: 16, right: 16, bottom: 16, left: 16 },
    minRenderSize: { width: 72, height: 44 },
  };
}

function candidateStyle(def: SkinAssetDefinition, file: string): CSSProperties {
  const url = `/assets/ui/soro-pon/skins/cute-pop/generated/candidates/${file}`;
  return skinAssetStyle(url, { ...def, file });
}

const row: CSSProperties = {
  display: 'flex',
  gap: 'var(--sp-space-12)',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  // selectedのtranslateY(-18%)がラベルへ被らないよう余白を確保する
  paddingTop: 'var(--sp-space-16)',
};

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>{label}</p>
      {children}
    </div>
  );
}

function tileVars(w: number): CSSProperties {
  return {
    '--tile-w': `${w}px`,
    '--tile-h': `${Math.round((w * 4) / 3)}px`,
  } as CSSProperties;
}

function TileSamples({ file }: { file: string }) {
  const style = candidateStyle(TILE_DEF, file);
  return (
    <>
      <div style={row}>
        <Labeled label="最小相当(24px/相手牌)">
          <TileCard
            name="ネコ"
            fallbackLabel="猫"
            emoji="🐱"
            categoryColor="#e58a3a"
            categoryName="動物"
            showName={false}
            style={{ ...style, ...tileVars(24) }}
          />
        </Labeled>
        <Labeled label="Result(42x56)">
          <TileCard
            name="ネコ"
            fallbackLabel="猫"
            emoji="🐱"
            categoryColor="#e58a3a"
            categoryName="動物"
            style={{ ...style, ...tileVars(42) }}
          />
        </Labeled>
        <Labeled label="手牌標準(54x72)">
          <TileCard
            name="オオカミ"
            fallbackLabel="狼"
            emoji="🐺"
            categoryColor="#7c5cbf"
            categoryName="夜行"
            style={{ ...style, ...tileVars(54) }}
          />
        </Labeled>
        <Labeled label="拡大(96x128)">
          <TileCard
            name="コウモリ"
            fallbackLabel="蝙"
            emoji="🦇"
            categoryColor="#4a90d9"
            categoryName="空"
            style={{ ...style, ...tileVars(96) }}
          />
        </Labeled>
        <Labeled label="selected(CSS状態と共存)">
          {/* translateY(-18%)がラベルへ被らないよう持ち上げ分の余白を足す */}
          <div style={{ paddingTop: 14 }}>
            <TileCard
              name="ネコ"
              fallbackLabel="猫"
              emoji="🐱"
              categoryColor="#e58a3a"
              categoryName="動物"
              selected
              style={{ ...style, ...tileVars(54) }}
            />
          </div>
        </Labeled>
        <Labeled label="ron強調">
          <div style={{ paddingTop: 14 }}>
            <TileCard
              name="ネコ"
              fallbackLabel="猫"
              emoji="🐱"
              categoryColor="#e58a3a"
              categoryName="動物"
              emphasis="ron"
              style={{ ...style, ...tileVars(54) }}
            />
          </div>
        </Labeled>
        <Labeled label="dimmed">
          <TileCard
            name="ネコ"
            fallbackLabel="猫"
            emoji="🐱"
            categoryColor="#e58a3a"
            categoryName="動物"
            dimmed
            style={{ ...style, ...tileVars(54) }}
          />
        </Labeled>
      </div>
    </>
  );
}

function TileBackSamples({ file }: { file: string }) {
  const style = candidateStyle(TILE_DEF, file);
  return (
    <div style={row}>
      <Labeled label="最小相当(24px)">
        <TileCard name="?" fallbackLabel="?" faceDown style={{ ...style, ...tileVars(24) }} />
      </Labeled>
      <Labeled label="相手牌(30px)">
        <TileCard name="?" fallbackLabel="?" faceDown style={{ ...style, ...tileVars(30) }} />
      </Labeled>
      <Labeled label="標準(54x72)">
        <TileCard name="?" fallbackLabel="?" faceDown style={{ ...style, ...tileVars(54) }} />
      </Labeled>
      <Labeled label="拡大(96x128)">
        <TileCard name="?" fallbackLabel="?" faceDown style={{ ...style, ...tileVars(96) }} />
      </Labeled>
    </div>
  );
}

function ButtonSamples({ file, height }: { file: string; height: number }) {
  const style = candidateStyle(buttonDef(height), file);
  return (
    <div style={row}>
      <Button variant="primary" style={{ ...style, minWidth: '72px' }}>
        進
      </Button>
      <Button variant="primary" style={style}>
        対局開始
      </Button>
      <Button variant="primary" style={style}>
        とてもとても長い日本語のボタンラベル確認
      </Button>
      <Button variant="primary" style={style} subLabel="8枚+この牌であがる(2行目)">
        ロン
      </Button>
      {/* disabledは本来button.disabled.background slotだが、面の視認確認用に同styleを当てる */}
      <Button variant="primary" style={{ ...style, opacity: 0.55 }} disabled>
        捨てる
      </Button>
    </div>
  );
}

export function R1TileButtonCandidateReview() {
  const { activeSkinId } = useSkin();
  if (activeSkinId !== 'cute-pop') {
    return (
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        R1候補(request 008/009)。上のSkin切り替えでCute Popを選ぶと表示される。
      </p>
    );
  }
  return (
    <>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        request 008(tile.face.base / tile.back.base)と009(button.primary.background)の
        Codex CLI起点候補。実TileCard/Buttonへstyle注入して確認する。文字・帯・◆は
        画像に焼き込まずDOMが描いている。production manifestへは未登録
        (candidatesレビュー専用経路)。承認までfinal昇格しない。
      </p>
      <h3>tile.face.base 候補(選択・ロン状態はCSS+状態レイヤーで表現 / ADR-015)</h3>
      {TILE_FACE_CANDIDATES.map((c) => (
        <div key={c.id} style={{ marginTop: 'var(--sp-space-12)' }}>
          <h4 style={{ margin: '0 0 4px' }}>{c.label}</h4>
          <TileSamples file={c.file} />
        </div>
      ))}
      <h3 style={{ marginTop: 'var(--sp-space-16)' }}>tile.back.base 候補</h3>
      {TILE_BACK_CANDIDATES.map((c) => (
        <div key={c.id} style={{ marginTop: 'var(--sp-space-12)' }}>
          <h4 style={{ margin: '0 0 4px' }}>{c.label}</h4>
          <TileBackSamples file={c.file} />
        </div>
      ))}
      <h3 style={{ marginTop: 'var(--sp-space-16)' }}>
        button.primary.background 候補(min幅 / 通常 / 長文 / 2行 / disabled相当)
      </h3>
      {BUTTON_CANDIDATES.map((c) => (
        <div key={c.id} style={{ marginTop: 'var(--sp-space-12)' }}>
          <h4 style={{ margin: '0 0 4px' }}>{c.label}</h4>
          <ButtonSamples file={c.file} height={c.height} />
        </div>
      ))}
    </>
  );
}
