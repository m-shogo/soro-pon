import type { CSSProperties, ReactNode } from 'react';
import { nineSliceRenderWidths, skinAssetStyle } from '../skins/SkinSurface';
import { useSkin } from '../skins/useSkin';
import type { SkinAssetDefinition } from '../skins/skinTypes';
import { Button } from '../components/Button';
import { PaperPanel } from '../components/PaperPanel';
import { TileCard } from '../components/TileCard';

/*
 * Batch 2候補(request 010/011)のレビューセクション。Gallery専用。
 * candidatesはproduction manifestへ未登録なので、実コンポーネントの
 * slot解決(useSkinAsset)では読み込まれない。ここではskinAssetStyle()を
 * 直接使い、実PaperPanel(panel.modal.background/panel.result.frameの
 * production leaf component)へstyle propとして注入してレビューする。
 * table.backgroundはGameTableLayoutがstyle上書きを受け付けない構造のため、
 * 同じCSSクラス(sp-match-layout系)とskinAssetStyleの出力を使った
 * Gallery-only fixtureで表現する(実TileCard/Buttonは本物のコンポーネント)。
 * production manifestへは未登録(candidatesレビュー専用経路。request 007/008/009と同方式)。
 * 人間承認されるまでfinal昇格もmanifest登録もしない。
 * 承認・昇格後にこのセクションは削除する。
 */

type Candidate = { id: 'a' | 'b' | 'c'; label: string; concept: string; file: string };

const TABLE_CANDIDATES: Candidate[] = [
  {
    id: 'a',
    label: 'A: パステル布プレイマット',
    concept: '繊維質感+軽い縫い目、四隅に玩具箱ディテール',
    file: 'table-background-candidate-a.png',
  },
  {
    id: 'b',
    label: 'B: クラフト紙ゲームマット',
    concept: '紙繊維+淡い印刷ずれ+鉛筆線、絵本的素材感',
    file: 'table-background-candidate-b.png',
  },
  {
    id: 'c',
    label: 'C: フェルト+刺繍マット',
    concept: 'フェルト質感+縁の縫い目、角のみアップリケ',
    file: 'table-background-candidate-c.png',
  },
];

const MODAL_CANDIDATES: Candidate[] = [
  {
    id: 'a',
    label: 'A: 絵本カード',
    concept: '厚手紙質感+色鉛筆縁、角のみ小さな飾り',
    file: 'panel-modal-background-candidate-a.png',
  },
  {
    id: 'b',
    label: 'B: クッションパイピングパネル',
    concept: 'クッション立体感+パイピング、角のみ刺繍',
    file: 'panel-modal-background-candidate-b.png',
  },
  {
    id: 'c',
    label: 'C: 玩具箱ラベルカード',
    concept: 'クラフト紙+ステッカー跡、手描きの縁',
    file: 'panel-modal-background-candidate-c.png',
  },
];

const RESULT_CANDIDATES: Candidate[] = [
  {
    id: 'a',
    label: 'A: 玩具箱リボンフレーム',
    concept: 'リボン+木製ビーズ+紙吹雪、中央は静か',
    file: 'panel-result-frame-candidate-a.png',
  },
  {
    id: 'b',
    label: 'B: 刺繍ワッペン風フレーム',
    concept: '布+ステッチ+小さな星、柔らかな立体感',
    file: 'panel-result-frame-candidate-b.png',
  },
  {
    id: 'c',
    label: 'C: 絵本見開きフレーム',
    concept: '手描きの祝福装飾+色鉛筆+紙の重なり',
    file: 'panel-result-frame-candidate-c.png',
  },
];

function candidateUrl(file: string): string {
  return `/assets/ui/soro-pon/skins/cute-pop/generated/candidates/${file}`;
}

const TABLE_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'cover',
  intrinsicSize: { width: 1920, height: 1080 },
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

function candidateStyle(def: SkinAssetDefinition, file: string): CSSProperties {
  const style = skinAssetStyle(candidateUrl(file), { ...def, file });
  // nine-sliceのborder-image-widthは実際のborder-widthを上書きしない環境がある
  // ため、レビュー専用に明示borderWidthを添える(production側のSkinLayer経路は
  // 対象コンポーネント自身のCSS classがborder-widthを持つため問題にならない)
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
  alignItems: 'flex-start',
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

// GameTableLayoutは内部でuseSkinSurfaceStyle('table.background')を呼び、
// styleのprop上書きを受け付けないため、同じCSSクラスとcandidate styleを
// 使ったGallery専用fixtureで表現する(TileCard/Buttonは本物のコンポーネント)。
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
        <TileCard
          name="ネコ"
          fallbackLabel="猫"
          emoji="🐱"
          categoryColor="#e58a3a"
          categoryName="動物"
          style={tileVars(48)}
        />
        <TileCard
          name="オオカミ"
          fallbackLabel="狼"
          emoji="🐺"
          categoryColor="#7c5cbf"
          categoryName="夜行"
          selected
          style={tileVars(48)}
        />
        <TileCard
          name="コウモリ"
          fallbackLabel="蝙"
          emoji="🦇"
          categoryColor="#4a90d9"
          categoryName="空"
          emphasis="ron"
          style={tileVars(48)}
        />
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
      <Labeled label="横長スマホ相当(932x430 crop, 320x148)">
        <div style={{ width: 320, height: 148, aspectRatio: '932/430' }}>
          <TableSample file={file} />
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

function ModalSamples({ file }: { file: string }) {
  const style = candidateStyle(MODAL_DEF, file);
  return (
    <div style={row}>
      <Labeled label="短い確認文(min size相当)">
        <PaperPanel style={{ ...style, width: 220 }} title="中断しますか?">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: '0 0 8px' }}>
            現在の対局を中断します。
          </p>
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
      <Labeled label="最大size相当(高さ伸縮)">
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
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: 0 }}>どうぶつ王国 120点</p>
        </PaperPanel>
      </Labeled>
      <Labeled label="lose相当">
        <PaperPanel style={{ ...style, width: 260 }} title="ロン — トモリ">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: 0 }}>あなたの支払い: -40点</p>
        </PaperPanel>
      </Labeled>
      <Labeled label="draw相当">
        <PaperPanel style={{ ...style, width: 260 }} title="流局">
          <p style={{ fontSize: 'var(--sp-font-sm)', margin: 0 }}>
            山が尽きました。誰の記憶も確定しませんでした。
          </p>
        </PaperPanel>
      </Labeled>
      <Labeled label="長い役リスト+スコア+ボタン(tall)">
        <PaperPanel style={{ ...style, width: 300, minHeight: 280 }} title="ツモ — あなた">
          <ul style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 8px', paddingLeft: 18 }}>
            <li>どうぶつ王国 80点</li>
            <li>ワイルド使用 1枚</li>
            <li>特別ボーナス「つよい仲間」+25点</li>
            <li>同じ牌3枚ボーナス +15点</li>
          </ul>
          <p style={{ fontSize: 'var(--sp-font-md)', fontWeight: 'bold', margin: '0 0 8px' }}>
            合計 120点
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-space-8)' }}>
            <Button variant="primary">もう一度</Button>
            <Button variant="ghost">TOPへ</Button>
          </div>
        </PaperPanel>
      </Labeled>
    </div>
  );
}

export function Batch2CandidateReview() {
  const { activeSkinId } = useSkin();
  if (activeSkinId !== 'cute-pop') {
    return (
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        Batch 2候補(request 010/011)。上のSkin切り替えでCute Popを選ぶと表示される。
      </p>
    );
  }
  return (
    <>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        request 010(table.background)と011(panel.modal.background /
        panel.result.frame)のCodex CLI起点候補。実PaperPanel/TileCard/Buttonへ
        style注入して確認する。table.backgroundのみGameTableLayoutがstyle
        上書きを受け付けないため、同じCSSクラスを使ったGallery専用fixture
        (内部のTileCard/Buttonは本物)で表現している。文字・帯はDOMが描画。
        production manifestへは未登録(candidatesレビュー専用経路)。
        承認までfinal昇格しない。
      </p>
      <h3>table.background 候補</h3>
      {TABLE_CANDIDATES.map((c) => (
        <div key={c.id} style={{ marginTop: 'var(--sp-space-12)' }}>
          <h4 style={{ margin: '0 0 4px' }}>
            {c.label}({c.concept})
          </h4>
          <TableSamples file={c.file} />
        </div>
      ))}
      <h3 style={{ marginTop: 'var(--sp-space-16)' }}>panel.modal.background 候補</h3>
      {MODAL_CANDIDATES.map((c) => (
        <div key={c.id} style={{ marginTop: 'var(--sp-space-12)' }}>
          <h4 style={{ margin: '0 0 4px' }}>
            {c.label}({c.concept})
          </h4>
          <ModalSamples file={c.file} />
        </div>
      ))}
      <h3 style={{ marginTop: 'var(--sp-space-16)' }}>panel.result.frame 候補</h3>
      {RESULT_CANDIDATES.map((c) => (
        <div key={c.id} style={{ marginTop: 'var(--sp-space-12)' }}>
          <h4 style={{ margin: '0 0 4px' }}>
            {c.label}({c.concept})
          </h4>
          <ResultSamples file={c.file} />
        </div>
      ))}
    </>
  );
}
