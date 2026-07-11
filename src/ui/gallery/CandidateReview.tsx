import type { CSSProperties } from 'react';
import { skinAssetStyle } from '../skins/SkinSurface';
import { useSkin } from '../skins/useSkin';
import type { SkinAssetDefinition } from '../skins/skinTypes';
import { Button } from '../components/Button';
import { PaperPanel } from '../components/PaperPanel';

/*
 * 本命候補アセットのレビューセクション(asset request 006)。Gallery専用。
 * candidatesはmanifest未登録のため、ここが唯一のプレビュー経路。
 * 人の承認が出るまでfinal昇格もmanifest登録もしない。
 * レビュー対象を増やすときはCANDIDATESへ追記する(実画面へ直書きしない)。
 */

type Candidate = {
  slot: string;
  file: string;
  def: SkinAssetDefinition;
};

const CUTE_POP_CANDIDATES: Candidate[] = [
  {
    slot: 'button.secondary.background',
    file: 'button-secondary-2x.png',
    def: {
      file: 'button-secondary-2x.png',
      status: 'placeholder',
      renderMode: 'nine-slice',
      intrinsicSize: { width: 480, height: 144 },
      pixelDensity: 2,
      transparent: true,
      nineSlice: { top: 32, right: 32, bottom: 32, left: 32 },
      nineSliceRender: { top: 16, right: 16, bottom: 16, left: 16 },
      minRenderSize: { width: 72, height: 44 },
      contentSafeArea: { top: 16, right: 16, bottom: 16, left: 16 },
    },
  },
  {
    slot: 'panel.paper.default',
    file: 'panel-paper-2x.png',
    def: {
      file: 'panel-paper-2x.png',
      status: 'placeholder',
      renderMode: 'nine-slice',
      intrinsicSize: { width: 768, height: 512 },
      pixelDensity: 2,
      transparent: true,
      nineSlice: { top: 48, right: 48, bottom: 48, left: 48 },
      nineSliceRender: { top: 24, right: 24, bottom: 24, left: 24 },
      minRenderSize: { width: 64, height: 64 },
      contentSafeArea: { top: 24, right: 24, bottom: 24, left: 24 },
    },
  },
];

function candidateStyle(candidate: Candidate): CSSProperties {
  const url = `/assets/ui/soro-pon/skins/cute-pop/generated/candidates/${candidate.file}`;
  return skinAssetStyle(url, candidate.def);
}

export function CandidateReview() {
  const { activeSkinId } = useSkin();
  if (activeSkinId !== 'cute-pop') {
    return (
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        Cute Popの候補レビュー。上のSkin切り替えでCute Popを選ぶと表示される。
      </p>
    );
  }
  const buttonStyle = candidateStyle(CUTE_POP_CANDIDATES[0]!);
  const panelStyle = candidateStyle(CUTE_POP_CANDIDATES[1]!);
  const row: CSSProperties = {
    display: 'flex',
    gap: 'var(--sp-space-12)',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  };
  return (
    <>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        request 006(button.secondary / panel.paper)。左がCSS fallback、右以降が候補適用。
      </p>
      <h3>button.secondary.background</h3>
      <div style={row}>
        <Button variant="paper">fallback</Button>
        <Button variant="paper" style={{ ...buttonStyle, minWidth: 72 }}>
          進
        </Button>
        <Button variant="paper" style={buttonStyle}>
          デッキ一覧
        </Button>
        <Button variant="paper" style={buttonStyle} subLabel="保存したデッキを確認・編集します">
          デッキ一覧
        </Button>
        <Button variant="paper" style={buttonStyle}>
          とてもとても長い日本語のメニューラベル確認
        </Button>
        <Button variant="paper" style={buttonStyle} disabled>
          編集
        </Button>
      </div>
      <h3>panel.paper.default</h3>
      <div style={row}>
        <PaperPanel style={{ width: 200 }} title="fallback">
          CSSフォールバック面。
        </PaperPanel>
        <PaperPanel style={{ ...panelStyle, width: 96, minHeight: 64 }}>最小</PaperPanel>
        <PaperPanel style={{ ...panelStyle, width: 240 }} title="標準パネル">
          白カード面。--sp-text-on-surfaceの文字が乗る。
        </PaperPanel>
        <PaperPanel style={{ ...panelStyle, width: 420 }} title="大型パネル">
          記憶の札を集め、役を作って競う遊びです。長い本文が入っても縁の太さは
          変わらず、四隅のドットも変形しないことを確認する。
        </PaperPanel>
      </div>
    </>
  );
}
