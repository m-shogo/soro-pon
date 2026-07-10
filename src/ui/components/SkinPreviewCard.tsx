import type { SkinPreviewSwatches } from '../skins/skinPreview';
import './components.css';

// スキン1件のプレビューカード(H4)。選択状態はaria-pressed+枠+ラベルで表現し、
// 色だけに依存しない。スウォッチは代表tokenの単色のみ(画像・任意CSSは使わない)。
export function SkinPreviewCard({
  label,
  swatches,
  active,
  disabled = false,
  onSelect,
}: {
  label: string;
  swatches: SkinPreviewSwatches;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`sp-skin-preview${active ? ' sp-skin-preview--active' : ''}`}
      aria-pressed={active}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="sp-skin-preview__swatches" aria-hidden="true">
        <span style={{ background: swatches.background }} />
        <span style={{ background: swatches.surface }} />
        <span style={{ background: swatches.primary }} />
        <span style={{ background: swatches.accent }} />
      </span>
      <span className="sp-skin-preview__label">
        {label}
        {active && <span className="sp-skin-preview__state">使用中</span>}
      </span>
    </button>
  );
}
