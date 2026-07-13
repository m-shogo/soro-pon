import type { CSSProperties } from 'react';
import { skinAssetStyle } from '../skins/SkinSurface';
import { useSkin } from '../skins/useSkin';
import type { SkinAssetDefinition } from '../skins/skinTypes';

/*
 * badge.info.background Codex CLI起点候補のレビューセクション(request 007)。
 * Gallery専用。candidatesはproduction manifestへ未登録なので、実際の
 * Badgeコンポーネント(useSkinSurfaceStyle経由)では読み込まれない。
 * ここではskinAssetStyle()を直接使い、candidatesパスをレビュー専用で
 * 描画する(実配信経路とは独立)。
 * 承認されるまでfinal昇格もmanifest登録もしない。
 */

type Candidate = {
  id: 'a' | 'b' | 'c';
  label: string;
  file: string;
};

const CANDIDATES: Candidate[] = [
  { id: 'a', label: 'A: 丸みのある紙ラベル', file: 'badge-info-background-candidate-a.png' },
  { id: 'b', label: 'B: 控えめなリボンタブ', file: 'badge-info-background-candidate-b.png' },
  { id: 'c', label: 'C: 小さなチケット形', file: 'badge-info-background-candidate-c.png' },
];

// 240x80 @2x、slot契約(base manifest badge.info.background)と同一ジオメトリ
const DEF: SkinAssetDefinition = {
  file: null,
  status: 'placeholder',
  renderMode: 'nine-slice',
  intrinsicSize: { width: 240, height: 80 },
  pixelDensity: 2,
  transparent: true,
  nineSlice: { top: 16, right: 16, bottom: 16, left: 16 },
  nineSliceRender: { top: 8, right: 8, bottom: 8, left: 8 },
  minRenderSize: { width: 24, height: 20 },
  contentSafeArea: { top: 8, right: 8, bottom: 8, left: 8 },
};

function candidateUrl(file: string): string {
  return `/assets/ui/soro-pon/skins/cute-pop/generated/candidates/${file}`;
}

function candidateStyle(file: string): CSSProperties {
  return skinAssetStyle(candidateUrl(file), { ...DEF, file });
}

const row: CSSProperties = {
  display: 'flex',
  gap: 'var(--sp-space-12)',
  alignItems: 'center',
  flexWrap: 'wrap',
};

function BadgeSwatch({
  file,
  width,
  height,
  background,
  children,
  extraStyle,
}: {
  file: string;
  width: number;
  height: number;
  background: string;
  children?: React.ReactNode;
  extraStyle?: CSSProperties;
}) {
  return (
    <span
      className="sp-badge sp-badge--info"
      style={{
        ...candidateStyle(file),
        width,
        height,
        minHeight: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        boxSizing: 'border-box',
        ...extraStyle,
      }}
    >
      {children}
    </span>
  );
}

export function BadgeInfoBackgroundReview() {
  const { activeSkinId } = useSkin();
  if (activeSkinId !== 'cute-pop') {
    return (
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        badge.info.background候補(request 007)。上のSkin切り替えでCute Popを選ぶと表示される。
      </p>
    );
  }
  return (
    <>
      <p style={{ fontSize: 'var(--sp-font-xs)', margin: 0 }}>
        request 007(Codex CLI起点画像生成、候補A/B/C)。文字は焼き込まずDOMで重ねている。
        production manifestへは未登録(candidatesレビュー専用経路)。
      </p>
      {CANDIDATES.map((c) => (
        <div key={c.id} style={{ marginTop: 'var(--sp-space-12)' }}>
          <h3>{c.label}</h3>
          <div style={row}>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>実寸(120x40)</p>
              <BadgeSwatch file={c.file} width={120} height={40} background="transparent">
                <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink)' }}>
                  情報
                </span>
              </BadgeSwatch>
            </div>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>最小(24x20)</p>
              <BadgeSwatch file={c.file} width={24} height={20} background="transparent" />
            </div>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>2倍拡大(240x80)</p>
              <BadgeSwatch file={c.file} width={240} height={80} background="transparent">
                <span style={{ fontSize: 'var(--sp-font-sm)', color: 'var(--sp-color-ink)' }}>
                  情報バッジ
                </span>
              </BadgeSwatch>
            </div>
          </div>
          <div style={{ ...row, marginTop: 'var(--sp-space-8)' }}>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>白背景</p>
              <BadgeSwatch file={c.file} width={120} height={40} background="#ffffff">
                <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink)' }}>
                  短
                </span>
              </BadgeSwatch>
            </div>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>暗背景</p>
              <BadgeSwatch file={c.file} width={120} height={40} background="#1e1512">
                <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink)' }}>
                  暗背景確認
                </span>
              </BadgeSwatch>
            </div>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>短いラベル(英数字)</p>
              <BadgeSwatch file={c.file} width={120} height={40} background="transparent">
                <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink)' }}>
                  NEW
                </span>
              </BadgeSwatch>
            </div>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>
                長いラベル(日本語)
              </p>
              <BadgeSwatch file={c.file} width={200} height={40} background="transparent">
                <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink)' }}>
                  この役はまだ未使用です
                </span>
              </BadgeSwatch>
            </div>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>
                focus相当(tabIndex)
              </p>
              <button
                type="button"
                className="sp-badge sp-badge--info"
                tabIndex={0}
                style={{
                  ...candidateStyle(c.file),
                  width: 120,
                  height: 40,
                  border: 'none',
                  cursor: 'default',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink)' }}>
                  focus確認
                </span>
              </button>
            </div>
            <div>
              <p style={{ fontSize: 'var(--sp-font-xs)', margin: '0 0 4px' }}>disabled相当</p>
              <BadgeSwatch
                file={c.file}
                width={120}
                height={40}
                background="transparent"
                extraStyle={{ opacity: 0.5, filter: 'grayscale(0.4)' }}
              >
                <span style={{ fontSize: 'var(--sp-font-xs)', color: 'var(--sp-color-ink)' }}>
                  無効
                </span>
              </BadgeSwatch>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
