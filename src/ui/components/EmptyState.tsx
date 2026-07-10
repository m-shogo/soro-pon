import './components.css';

// 空状態の共通表現。文言散在を防ぐ。
export function EmptyState({
  icon = '◆',
  message,
  hint,
}: {
  icon?: string;
  message: string;
  hint?: string;
}) {
  return (
    <div className="sp-empty-state">
      <span className="sp-empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="sp-empty-state__message">{message}</p>
      {hint !== undefined && <p className="sp-empty-state__hint">{hint}</p>}
    </div>
  );
}

// エラー状態の共通表現。色だけに依存せず文言で伝える。
export function ErrorState({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="sp-error-state" role="alert">
      <span className="sp-error-state__icon" aria-hidden="true">
        ⚠
      </span>
      <p className="sp-empty-state__message">{message}</p>
      {detail !== undefined && <p className="sp-empty-state__hint">{detail}</p>}
    </div>
  );
}
