import type { CSSProperties, ReactNode } from 'react';
import { nineSliceRenderWidths, skinAssetStyle } from '../skins/SkinSurface';
import { useSkin } from '../skins/useSkin';
import type { SkinAssetDefinition } from '../skins/skinTypes';
import { Button } from '../components/Button';
import { PaperPanel } from '../components/PaperPanel';
import { TileCard } from '../components/TileCard';

/*
 * Batch 3(request 012-015、ヨルノシルベ中核8slot)のレビューセクション。
 * Gallery専用。candidatesはproduction manifestへ未登録なので、実コンポーネント
 * のslot解決(useSkinAsset)では読み込まれない。ここではskinAssetStyle()を
 * 直接使い、実PaperPanel/TileCard/Buttonへstyle propとして注入してレビューする
 * (Batch 2のBatch2CandidateReview.tsx、R1のR1TileButtonCandidateReview.tsxと
 * 同方式)。table.backgroundのみGameTableLayoutがstyle上書きを受け付けない
 * ため、同じCSSクラスを使ったGallery専用fixtureで表現する。
 * ヨルノシルベ選択時のみ表示する(Cute Popへは漏洩しない)。
 * 人間承認されるまでfinal昇格もmanifest登録もしない。承認・昇格後に削除する。
 */

type Candidate = {
  id: 'a' | 'b' | 'c';
  label: string;
  concept: string;
  file: string;
  concern?: string;
};

function candidateUrl(file: string): string {
  return `/assets/ui/soro-pon/skins/yorunoshirube/generated/candidates/${file}`;
}

const TABLE_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 夜の地図帳', concept: '深い黒紺の紙+手描き街路+隅の街灯', file: 'table-background-candidate-a.png' },
  {
    id: 'b',
    label: 'B: 黒インクの街(和風要素除外版)',
    concept: '墨の濃淡+紙の折れ+川筋',
    file: 'table-background-candidate-b.png',
    concern: '初回案はtorii/pagodaを含み機械却下、和風建築を明示除外して再生成(B2)。周辺detailが3案中やや高密度',
  },
  { id: 'c', label: 'C: 旅のノートと蝋引き紙', concept: '蝋引きの半透明感+鉛筆線+旅の記録片', file: 'table-background-candidate-c.png' },
];

const PAPER_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 記録用紙', concept: '紙繊維+軽いインク縁、最も静か', file: 'panel-paper-default-candidate-a.png' },
  { id: 'b', label: 'B: 蝋引き地図片', concept: '半透明層+折り線', file: 'panel-paper-default-candidate-b.png' },
  { id: 'c', label: 'C: 糸綴じメモカード', concept: '紙の積層+糸綴じ跡', file: 'panel-paper-default-candidate-c.png' },
];

const MODAL_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 黒い封筒からの記録紙', concept: '封蝋跡+中央明るい', file: 'panel-modal-background-candidate-a.png' },
  { id: 'b', label: 'B: 挟み込まれた半透明紙', concept: '淡い街路線+黒インク縁', file: 'panel-modal-background-candidate-b.png' },
  { id: 'c', label: 'C: 夜の旅行ノート', concept: '紙の重なり+糸綴じ+角の小さな光', file: 'panel-modal-background-candidate-c.png' },
];

const RESULT_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 旅の記録帳の表紙', concept: '複数の小さな街灯+黒インクの地図線', file: 'panel-result-frame-candidate-a.png' },
  { id: 'b', label: 'B: 夜明け前の記念台紙', concept: '淡い紫+紙の積層+小さな光', file: 'panel-result-frame-candidate-b.png' },
  {
    id: 'c',
    label: 'C: 忘れ物の標本箱(フラット版)',
    concept: '薄い硝子質感+糸綴じ+単一の小さな光',
    file: 'panel-result-frame-candidate-c.png',
    concern: '初回案は浮き彫りベゼル+宝石調装飾で「黒金高級UI」の禁止印象に近く機械却下、フラットな紙+薄い硝子へ変更して再生成(C2)',
  },
];

const BUTTON_PRIMARY_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 街灯の光を閉じ込めた硝子', concept: '最も強い光。ink-black housing', file: 'button-primary-background-candidate-a.png' },
  { id: 'b', label: 'B: ランタンの札', concept: '紙+薄い硝子、内側から発光', file: 'button-primary-background-candidate-b.png' },
  { id: 'c', label: 'C: 夜明け前の標識', concept: '縁の導光ライン', file: 'button-primary-background-candidate-c.png' },
];

const PRIMARY_REFERENCE_FILE = 'button-primary-background-candidate-a.png';

const BUTTON_SECONDARY_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 消えかけた鉛筆標識', concept: '鉛筆線+淡い灰青の陰影', file: 'button-secondary-background-candidate-a.png' },
  { id: 'b', label: 'B: 夜の切符', concept: '小さな切り欠き+印刷ずれ', file: 'button-secondary-background-candidate-b.png' },
  { id: 'c', label: 'C: 古いタグ', concept: '糸穴+蝋引き紙', file: 'button-secondary-background-candidate-c.png' },
];

const TILE_FACE_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 明るい記憶の紙片', concept: '古紙アイボリー+隅の小さな光', file: 'tile-face-base-candidate-a.png' },
  {
    id: 'b',
    label: 'B: 地図帳の切り抜き',
    concept: '淡い街路線+デッケル(手切り)エッジ',
    file: 'tile-face-base-candidate-b.png',
    concern: '街路線が縁の広い範囲を回っており、24px縮小時にノイズ化するリスクがやや高い',
  },
  { id: 'c', label: 'C: 古い写真の台紙', concept: '乳剤感+隅のみ手描きフレーム', file: 'tile-face-base-candidate-c.png' },
];

const TILE_BACK_CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 封蝋紙+型押しの輪', concept: '黒紺+中央の型押しリング+糸綴じ', file: 'tile-back-base-candidate-a.png' },
  { id: 'b', label: 'B: 地図の裏面(型押し)', concept: '型押しのルート線、印刷ではなく凹凸', file: 'tile-back-base-candidate-b.png' },
  {
    id: 'c',
    label: 'C: 蝋引きカード(フラット版)',
    concept: '単一の琥珀点+薄い縁の型押し、中央は無地',
    file: 'tile-back-base-candidate-c.png',
    concern: '初回案は全面ダイヤモンドキルト柄でCute Popのキルトモチーフに酷似し機械却下、中央無地+単一隅アクセントへ変更して再生成(C2)',
  },
];

const TABLE_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'cover',
  intrinsicSize: { width: 1920, height: 1080 },
};

const PAPER_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'nine-slice',
  intrinsicSize: { width: 384, height: 256 },
  transparent: true,
  nineSlice: { top: 24, right: 24, bottom: 24, left: 24 },
  contentSafeArea: { top: 12, right: 12, bottom: 12, left: 12 },
  minRenderSize: { width: 64, height: 64 },
};

const MODAL_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'nine-slice',
  intrinsicSize: { width: 512, height: 384 },
  transparent: true,
  nineSlice: { top: 24, right: 24, bottom: 24, left: 24 },
  contentSafeArea: { top: 16, right: 16, bottom: 16, left: 16 },
  minRenderSize: { width: 96, height: 96 },
};

const RESULT_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'nine-slice',
  intrinsicSize: { width: 512, height: 384 },
  transparent: true,
  nineSlice: { top: 32, right: 32, bottom: 32, left: 32 },
  contentSafeArea: { top: 16, right: 16, bottom: 16, left: 16 },
  minRenderSize: { width: 96, height: 96 },
};

const BUTTON_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'nine-slice',
  intrinsicSize: { width: 240, height: 72 },
  transparent: true,
  nineSlice: { top: 16, right: 16, bottom: 16, left: 16 },
  contentSafeArea: { top: 8, right: 8, bottom: 8, left: 8 },
  minRenderSize: { width: 72, height: 44 },
};

const TILE_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'stretch',
  intrinsicSize: { width: 300, height: 400 },
  transparent: true,
};

function candidateStyle(def: SkinAssetDefinition, file: string): CSSProperties {
  const style = skinAssetStyle(candidateUrl(file), { ...def, file });
  if (def.renderMode === 'nine-slice') {
    const render = nineSliceRenderWidths(def);
    return {
      ...style,
      borderWidth: `${render.top}px ${render.right}px ${render.bottom}px ${render.left}px`,
    };
  }
  return style;
}

const row: CSSProperties = {
  display: 'flex',
  gap: 'var(--sp-space-12)',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
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
  return { '--tile-w': `${w}px`, '--tile-h': `${Math.round((w * 4) / 3)}px` } as CSSProperties;
}

function TableSample({ file }: { file: string }) {
  const style = candidateStyle(TABLE_DEF, file);
  return (
    <div
      className="sp-match-layout sp-fallback-table-bg"
      style={{
        ...style,
        position: 'relative',
        borderRadius: 'var(--sp-radius-md)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--sp-space-8)',
        padding: 'var(--sp-space-12)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--sp-space-8)', flexWrap: 'wrap' }}>
        <TileCard name="キツネ" fallbackLabel="狐" emoji="🦊" categoryColor="#c46a2f" categoryName="夜行" style={tileVars(48)} />
        <TileCard name="フクロウ" fallbackLabel="梟" emoji="🦉" categoryColor="#5a4a8a" categoryName="夜行" selected style={tileVars(48)} />
        <TileCard name="ホタル" fallbackLabel="蛍" emoji="✨" categoryColor="#c9a227" categoryName="光" emphasis="ron" style={tileVars(48)} />
        <TileCard name="?" fallbackLabel="?" faceDown style={tileVars(48)} />
      </div>
      <div>
        <Button variant="primary">捨てる</Button>
      </div>
    </div>
  );
}

function TableSamples({ file }: { file: string }) {
  return (
    <div style={row}>
      <Labeled label="標準横画面相当(844x390 crop, 320x148)">
        <div style={{ width: 320, height: 148 }}>
          <TableSample file={file} />
        </div>
      </Labeled>
      <Labeled label="modal open時の透け相当">
        <div style={{ width: 320, height: 148, position: 'relative' }}>
          <TableSample file={file} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 20, 0.35)' }} />
        </div>
      </Labeled>
      <Labeled label="desktop相当(1366x768 crop, 480x270)">
        <div style={{ width: 480, height: 270 }}>
          <TableSample file={file} />
        </div>
      </Labeled>
    </div>
  );
}

function PaperSamples({ file }: { file: string }) {
  const style = candidateStyle(PAPER_DEF, file);
  return (
    <div style={row}>
      <Labeled label="short">
        <PaperPanel style={{ ...style, width: 180 }} title="設定">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: 0 }}>短い本文。</p>
        </PaperPanel>
      </Labeled>
      <Labeled label="list">
        <PaperPanel style={{ ...style, width: 200 }} title="デッキ一覧">
          <ul style={{ fontSize: 'var(--sp-font-sm)', margin: 0, paddingLeft: 18 }}>
            <li>動物スターター</li>
            <li>夜行性デッキ</li>
          </ul>
        </PaperPanel>
      </Labeled>
      <Labeled label="minRenderSize相当(64x64)">
        <div style={{ ...style, width: 64, height: 64 }} />
      </Labeled>
      <Labeled label="empty">
        <PaperPanel style={{ ...style, width: 160, minHeight: 60 }} />
      </Labeled>
    </div>
  );
}

function ModalSamples({ file }: { file: string }) {
  const style = candidateStyle(MODAL_DEF, file);
  return (
    <div style={row}>
      <Labeled label="短い確認文(min size相当)">
        <PaperPanel style={{ ...style, width: 220 }} title="中断しますか?">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: '0 0 8px' }}>現在の対局を中断します。</p>
          <div style={{ display: 'flex', gap: 'var(--sp-space-8)' }}>
            <Button variant="primary">中断する</Button>
            <Button variant="ghost">やめる</Button>
          </div>
        </PaperPanel>
      </Labeled>
      <Labeled label="長文(きせかえ説明相当)">
        <PaperPanel style={{ ...style, width: 320 }} title="きせかえ">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: '0 0 8px' }}>
            見た目のスキンを切り替えます。ヨルノシルベは夜の記憶帳をテーマにした
            落ち着いた雰囲気、Cute Popは明るくポップな雰囲気です。いつでも
            切り替え可能で、対局中のルールや操作性は変わりません。
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-space-8)' }}>
            <Button variant="paper">ヨルノシルベ</Button>
            <Button variant="paper">Cute Pop</Button>
          </div>
        </PaperPanel>
      </Labeled>
      <Labeled label="選択リスト+エラー文">
        <PaperPanel style={{ ...style, width: 260 }} title="デッキを選ぶ">
          <ul style={{ fontSize: 'var(--sp-font-sm)', margin: '0 0 8px', paddingLeft: 18 }}>
            <li>動物スターター</li>
            <li>海の仲間デッキ</li>
            <li>夜行性デッキ</li>
          </ul>
          <p style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-danger)', margin: 0 }}>
            score-budgetの検証に失敗しました
          </p>
        </PaperPanel>
      </Labeled>
      <Labeled label="tall(高さ伸縮)">
        <PaperPanel style={{ ...style, width: 220, minHeight: 260 }} title="長い本文でのcontent safe area確認">
          <p style={{ fontSize: 'var(--sp-font-sm)' }}>
            1行目のテキストです。
            <br />
            2行目、3行目と本文が続いても、四隅の装飾が変形せず、
            <br />
            中央帯が一様に伸縮することを確認します。
          </p>
        </PaperPanel>
      </Labeled>
    </div>
  );
}

function ResultSamples({ file }: { file: string }) {
  const style = candidateStyle(RESULT_DEF, file);
  return (
    <div style={row}>
      <Labeled label="win相当(コンパクト)">
        <PaperPanel style={{ ...style, width: 260 }} title="ツモ — あなた">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: 0 }}>夜の地図 120点</p>
        </PaperPanel>
      </Labeled>
      <Labeled label="lose相当">
        <PaperPanel style={{ ...style, width: 260 }} title="ロン — トモリ">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: 0 }}>あなたの支払い: -40点</p>
        </PaperPanel>
      </Labeled>
      <Labeled label="draw相当">
        <PaperPanel style={{ ...style, width: 260 }} title="流局">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: 0 }}>山が尽きました。誰の記憶も確定しませんでした。</p>
        </PaperPanel>
      </Labeled>
      <Labeled label="長い役リスト+スコア+ボタン(tall)">
        <PaperPanel style={{ ...style, width: 300, minHeight: 280 }} title="ツモ — あなた">
          <ul style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 8px', paddingLeft: 18 }}>
            <li>夜の地図 80点</li>
            <li>ワイルド使用 1枚</li>
            <li>特別ボーナス「つよい仲間」+25点</li>
            <li>同じ牌3枚ボーナス +15点</li>
          </ul>
          <p style={{ fontSize: 'var(--sp-font-md)', fontWeight: 'bold', margin: '0 0 8px' }}>合計 120点</p>
          <div style={{ display: 'flex', gap: 'var(--sp-space-8)' }}>
            <Button variant="primary">もう一度</Button>
            <Button variant="ghost">TOPへ</Button>
          </div>
        </PaperPanel>
      </Labeled>
    </div>
  );
}

function ButtonPrimarySamples({ file }: { file: string }) {
  const style = candidateStyle(BUTTON_DEF, file);
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
      <Button variant="primary" style={{ ...style, opacity: 0.55 }} disabled>
        捨てる
      </Button>
    </div>
  );
}

function ButtonSecondarySamples({ primaryFile, secondaryFile }: { primaryFile: string; secondaryFile: string }) {
  const primaryStyle = candidateStyle(BUTTON_DEF, primaryFile);
  const secondaryStyle = candidateStyle(BUTTON_DEF, secondaryFile);
  return (
    <div style={row}>
      <Labeled label="primary/secondary並列(階層差の確認)">
        <div style={{ display: 'flex', gap: 'var(--sp-space-8)' }}>
          <Button variant="primary" style={primaryStyle}>
            対局開始
          </Button>
          <Button variant="ink" style={secondaryStyle}>
            もどる
          </Button>
        </div>
      </Labeled>
      <Button variant="ink" style={secondaryStyle}>
        キャンセル
      </Button>
      <Button variant="ink" style={secondaryStyle}>
        とても長い日本語のセカンダリラベル確認
      </Button>
      <Button variant="ink" style={{ ...secondaryStyle, opacity: 0.55 }} disabled>
        削除
      </Button>
    </div>
  );
}

function TileFaceSamples({ file }: { file: string }) {
  const style = candidateStyle(TILE_DEF, file);
  return (
    <div style={row}>
      <Labeled label="最小相当(24px)">
        <TileCard name="キツネ" fallbackLabel="狐" emoji="🦊" categoryColor="#c46a2f" categoryName="夜行" showName={false} style={{ ...style, ...tileVars(24) }} />
      </Labeled>
      <Labeled label="Result(42x56)">
        <TileCard name="キツネ" fallbackLabel="狐" emoji="🦊" categoryColor="#c46a2f" categoryName="夜行" style={{ ...style, ...tileVars(42) }} />
      </Labeled>
      <Labeled label="手牌標準(54x72)">
        <TileCard name="フクロウ" fallbackLabel="梟" emoji="🦉" categoryColor="#5a4a8a" categoryName="夜行" style={{ ...style, ...tileVars(54) }} />
      </Labeled>
      <Labeled label="拡大(96x128)">
        <TileCard name="ホタル" fallbackLabel="蛍" emoji="✨" categoryColor="#c9a227" categoryName="光" style={{ ...style, ...tileVars(96) }} />
      </Labeled>
      <Labeled label="selected">
        <TileCard name="キツネ" fallbackLabel="狐" emoji="🦊" categoryColor="#c46a2f" categoryName="夜行" selected style={{ ...style, ...tileVars(54) }} />
      </Labeled>
      <Labeled label="ron強調">
        <TileCard name="キツネ" fallbackLabel="狐" emoji="🦊" categoryColor="#c46a2f" categoryName="夜行" emphasis="ron" style={{ ...style, ...tileVars(54) }} />
      </Labeled>
      <Labeled label="tsumo強調">
        <TileCard name="キツネ" fallbackLabel="狐" emoji="🦊" categoryColor="#c46a2f" categoryName="夜行" emphasis="tsumo" style={{ ...style, ...tileVars(54) }} />
      </Labeled>
      <Labeled label="dimmed">
        <TileCard name="キツネ" fallbackLabel="狐" emoji="🦊" categoryColor="#c46a2f" categoryName="夜行" dimmed style={{ ...style, ...tileVars(54) }} />
      </Labeled>
    </div>
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
      <Labeled label="山(連続表示)">
        <div style={{ display: 'flex', gap: 2 }}>
          <TileCard name="?" fallbackLabel="?" faceDown style={{ ...style, ...tileVars(30) }} />
          <TileCard name="?" fallbackLabel="?" faceDown style={{ ...style, ...tileVars(30) }} />
          <TileCard name="?" fallbackLabel="?" faceDown style={{ ...style, ...tileVars(30) }} />
        </div>
      </Labeled>
    </div>
  );
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <>
      <h3 style={{ marginTop: 'var(--sp-space-16)' }}>{title}</h3>
      {hint && <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 8px', opacity: 0.8 }}>{hint}</p>}
    </>
  );
}

function CandidateBlock({ c, children }: { c: Candidate; children: ReactNode }) {
  return (
    <div style={{ marginTop: 'var(--sp-space-12)' }}>
      <h4 style={{ margin: '0 0 4px' }}>
        {c.label}({c.concept})
      </h4>
      {c.concern && (
        <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 6px', color: 'var(--sp-color-danger)' }}>
          known concern: {c.concern}
        </p>
      )}
      {children}
    </div>
  );
}

export function Batch3YorunoshirubeCandidateReview() {
  const { activeSkinId } = useSkin();
  if (activeSkinId !== 'yorunoshirube') {
    return (
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        Batch 3候補(request 012-015、ヨルノシルベ中核8slot)。上のSkin切り替えで
        ヨルノシルベを選ぶと表示される(Cute Popへは候補を表示しない)。
      </p>
    );
  }
  return (
    <>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        request 012(table.background)/ 013(panel.paper.default /
        panel.modal.background / panel.result.frame)/ 014(button.primary /
        button.secondary)/ 015(tile.face.base / tile.back.base)のCodex CLI
        起点候補(各slot最大3案、計24候補)。実PaperPanel/TileCard/Buttonへ
        style注入して確認する。文字・帯はDOMが描画。production manifestへは
        未登録(candidatesレビュー専用経路)。machine recommendation only —
        human review pending。承認までfinal昇格しない。
      </p>

      <SectionHeading title="1. table.background 候補" hint="夜の地図帳。最も静かな土台" />
      {TABLE_CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <TableSamples file={c.file} />
        </CandidateBlock>
      ))}

      <SectionHeading title="2. panel.paper.default 候補" hint="日常的な記録カード。最も低密度" />
      {PAPER_CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <PaperSamples file={c.file} />
        </CandidateBlock>
      ))}

      <SectionHeading title="3. button.primary.background 候補" hint="最も強い光。街灯/ランタン語彙" />
      {BUTTON_PRIMARY_CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <ButtonPrimarySamples file={c.file} />
        </CandidateBlock>
      ))}

      <SectionHeading title="4. button.secondary.background 候補" hint="primaryより明確に弱い光" />
      {BUTTON_SECONDARY_CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <ButtonSecondarySamples primaryFile={PRIMARY_REFERENCE_FILE} secondaryFile={c.file} />
        </CandidateBlock>
      ))}

      <SectionHeading title="5. tile.face.base 候補" hint="記憶の紙片。文字最優先(状態はADR-015でbase合成レイヤー)" />
      {TILE_FACE_CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <TileFaceSamples file={c.file} />
        </CandidateBlock>
      ))}

      <SectionHeading title="6. tile.back.base 候補" hint="封じられた記憶。faceとは異なるモチーフ" />
      {TILE_BACK_CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <TileBackSamples file={c.file} />
        </CandidateBlock>
      ))}

      <SectionHeading title="7. panel.modal.background 候補" hint="重要な記憶を開くパネル。paper.defaultより中密度・可読性優先" />
      {MODAL_CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <ModalSamples file={c.file} />
        </CandidateBlock>
      ))}

      <SectionHeading title="8. panel.result.frame 候補" hint="旅の記録帳の表紙。静かな達成感、Batch 3中最高密度" />
      {RESULT_CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <ResultSamples file={c.file} />
        </CandidateBlock>
      ))}
    </>
  );
}
