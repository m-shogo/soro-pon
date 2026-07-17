import type { CSSProperties, ReactNode } from 'react';
import { nineSliceRenderWidths, skinAssetStyle } from '../skins/SkinSurface';
import { useSkin } from '../skins/useSkin';
import type { SkinAssetDefinition } from '../skins/skinTypes';
import { PaperPanel } from '../components/PaperPanel';

/*
 * Batch 4(request 016、ヨルノシルベ badge.info.background)のレビューセクション。
 * Gallery専用。candidatesはproduction manifestへ未登録なので、実Badge.tsx
 * のslot解決(useSkinSurfaceStyle)では読み込まれない。Badge.tsxはstyle上書きを
 * 受け付けないため、同じCSSクラス(sp-badge / sp-badge--info)を使ったGallery
 * 専用fixtureへskinAssetStyle()を直接注入して確認する
 * (Batch 3のBatch3YorunoshirubeCandidateReview.tsxのtable.background方式と同じ)。
 * ヨルノシルベ選択時のみ表示する(Cute Popへは漏洩しない)。
 * 人間承認されるまでfinal昇格もmanifest登録もしない。承認・昇格後に削除する。
 */

type Candidate = {
  id: 'a' | 'b' | 'c';
  label: string;
  concept: string;
  material: string;
  file: string;
  occupancy: string;
  concern?: string;
  machineNote: string;
};

function candidateUrl(file: string): string {
  return `/assets/ui/soro-pon/skins/yorunoshirube/generated/candidates/${file}`;
}

const BADGE_DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'nine-slice',
  intrinsicSize: { width: 240, height: 80 },
  transparent: true,
  nineSlice: { top: 16, right: 16, bottom: 16, left: 16 },
  contentSafeArea: { top: 8, right: 8, bottom: 8, left: 8 },
  minRenderSize: { width: 24, height: 20 },
};

const CANDIDATES: Candidate[] = [
  {
    id: 'a',
    label: 'A: 夜の索引タブ',
    concept: '地図帳のページ端に付けた小さな索引',
    material: '薄い蝋引き紙+黒インクの不均一な縁+小さな琥珀点',
    file: 'badge-info-background-candidate-a.png',
    occupancy: 'widthRatio 0.8417 / heightRatio 0.8250 / centerOffset 0/0',
    machineNote: '最も汎用的。小型耐性重視。button/panelに見えない直線的な索引構造',
  },
  {
    id: 'b',
    label: 'B: グラシン紙の記録ラベル',
    concept: '半透明の紙の積層+片隅のインク印',
    material: '半透明グラシン紙+煤けた青灰+柔らかな紙繊維',
    file: 'badge-info-background-candidate-b.png',
    occupancy: 'widthRatio 0.6167 / heightRatio 0.8375 / centerOffset 0/0.0063',
    machineNote: '画像生成でしか出しにくい透明紙質。panel.modal.background(candidate B)との素材連続性',
  },
  {
    id: 'c',
    label: 'C: 写真フィルムの見出し片',
    concept: '古い写真フィルムの乳剤感',
    material: '黒紺の薄いタブ+片端の小さな光点+微細な印刷ずれ',
    file: 'badge-info-background-candidate-c.png',
    occupancy: 'widthRatio 0.8417 / heightRatio 0.7125 / centerOffset 0/0.0063',
    machineNote: '記憶・記録の意味が強い。tile.face.baseの古写真候補とは別の小型ラベル用途',
  },
];

function candidateStyle(file: string): CSSProperties {
  const style = skinAssetStyle(candidateUrl(file), { ...BADGE_DEF, file });
  const render = nineSliceRenderWidths(BADGE_DEF);
  return {
    ...style,
    borderWidth: `${render.top}px ${render.right}px ${render.bottom}px ${render.left}px`,
  };
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>{label}</p>
      {children}
    </div>
  );
}

const row: CSSProperties = {
  display: 'flex',
  gap: 'var(--sp-space-12)',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
};

function InfoBadgeSample({
  file,
  width,
  height,
  children,
}: {
  file: string;
  width: number;
  height: number;
  children?: ReactNode;
}) {
  return (
    <span
      className="sp-badge sp-badge--info"
      style={{ ...candidateStyle(file), width, height, boxSizing: 'border-box' }}
    >
      {children}
    </span>
  );
}

function SizeSamples({ file }: { file: string }) {
  return (
    <div style={row}>
      <Labeled label="24x20(minRenderSize)">
        <InfoBadgeSample file={file} width={24} height={20} />
      </Labeled>
      <Labeled label="32x20">
        <InfoBadgeSample file={file} width={32} height={20} />
      </Labeled>
      <Labeled label="48x24">
        <InfoBadgeSample file={file} width={48} height={24}>
          12
        </InfoBadgeSample>
      </Labeled>
      <Labeled label="72x28">
        <InfoBadgeSample file={file} width={72} height={28}>
          遊べる
        </InfoBadgeSample>
      </Labeled>
      <Labeled label="120x40">
        <InfoBadgeSample file={file} width={120} height={40}>
          記憶コイン 12
        </InfoBadgeSample>
      </Labeled>
      <Labeled label="long-width example">
        <InfoBadgeSample file={file} width={200} height={28}>
          称号: 夜の道しるべ
        </InfoBadgeSample>
      </Labeled>
    </div>
  );
}

function ProductionContextSamples({ file }: { file: string }) {
  return (
    <div style={row}>
      <Labeled label="Badge単体">
        <InfoBadgeSample file={file} width={90} height={26}>
          記憶コイン 12
        </InfoBadgeSample>
      </Labeled>
      <Labeled label="PaperPanel上(CollectionScreen相当)">
        <PaperPanel style={{ width: 220 }} title="クリアボード">
          <InfoBadgeSample file={file} width={90} height={26}>
            記憶コイン 12
          </InfoBadgeSample>
        </PaperPanel>
      </Labeled>
      <Labeled label="Modal上(DeckEditor検証結果相当)">
        <PaperPanel variant="ink" style={{ width: 240 }} title="検証">
          <InfoBadgeSample file={file} width={130} height={26}>
            INFO このカテゴリは未使用です
          </InfoBadgeSample>
        </PaperPanel>
      </Labeled>
      <Labeled label="DeckEditor row(playable)">
        <InfoBadgeSample file={file} width={80} height={24}>
          遊べる
        </InfoBadgeSample>
      </Labeled>
      <Labeled label="DeckDetail(canPlay)">
        <InfoBadgeSample file={file} width={80} height={24}>
          遊べる
        </InfoBadgeSample>
      </Labeled>
      <Labeled label="dark table background上">
        <div
          className="sp-fallback-table-bg"
          style={{ padding: 12, borderRadius: 'var(--sp-radius-md)' }}
        >
          <InfoBadgeSample file={file} width={90} height={26}>
            記憶コイン 12
          </InfoBadgeSample>
        </div>
      </Labeled>
      <Labeled label="warning badgeとの並列(識別確認)">
        <div style={{ display: 'flex', gap: 'var(--sp-space-8)', alignItems: 'center' }}>
          <InfoBadgeSample file={file} width={100} height={26}>
            INFO 記憶確定
          </InfoBadgeSample>
          <span className="sp-badge sp-badge--warning">WARN wildcardが多すぎます</span>
        </div>
      </Labeled>
      <Labeled label="long Japanese label">
        <InfoBadgeSample file={file} width={220} height={26}>
          称号: 夜の道しるべを持つ者
        </InfoBadgeSample>
      </Labeled>
      <Labeled label="icon + short text">
        <InfoBadgeSample file={file} width={70} height={24}>
          i 情報
        </InfoBadgeSample>
      </Labeled>
    </div>
  );
}

function CandidateBlock({ c, children }: { c: Candidate; children: ReactNode }) {
  return (
    <div style={{ marginTop: 'var(--sp-space-12)' }}>
      <h4 style={{ margin: '0 0 4px' }}>
        {c.label}({c.concept})
      </h4>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 2px' }}>material: {c.material}</p>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 2px' }}>occupancy: {c.occupancy}</p>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 6px', opacity: 0.85 }}>
        machine recommendation note: {c.machineNote}
      </p>
      {c.concern && (
        <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 6px', color: 'var(--sp-color-danger)' }}>
          known concern: {c.concern}
        </p>
      )}
      {children}
    </div>
  );
}

export function Batch4YorunoshirubeBadgeInfoReview() {
  const { activeSkinId } = useSkin();
  if (activeSkinId !== 'yorunoshirube') {
    return (
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        Batch 4候補(request 016、ヨルノシルベ badge.info.background)。上のSkin
        切り替えでヨルノシルベを選ぶと表示される(Cute Popへは候補を表示しない)。
      </p>
    );
  }
  return (
    <>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        request 016(badge.info.background)のCodex CLI起点候補(最大3案)。実
        Badge.tsxと同じCSSクラスへstyle注入して確認する。production manifest
        へは未登録(candidatesレビュー専用経路)。machine recommendation only —
        human review pending。承認までfinal昇格しない。Cute Popはすでにfinal
        (request 007, candidate B, v3)。
      </p>

      <h4 style={{ marginTop: 'var(--sp-space-12)' }}>Size proof(24x20〜120x40 + 長文)</h4>
      {CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <SizeSamples file={c.file} />
        </CandidateBlock>
      ))}

      <h4 style={{ marginTop: 'var(--sp-space-16)' }}>
        Production-context preview(実consumer相当のDOM/文字/layout)
      </h4>
      {CANDIDATES.map((c) => (
        <CandidateBlock key={c.id} c={c}>
          <ProductionContextSamples file={c.file} />
        </CandidateBlock>
      ))}
    </>
  );
}
