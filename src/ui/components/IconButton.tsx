import type { ButtonHTMLAttributes } from 'react';
import './components.css';

// アイコンだけの正方ボタン(44px最小タッチ確保、aria-label必須)。
export function IconButton({
  label,
  icon,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`sp-icon-button${className ? ` ${className}` : ''}`}
      {...rest}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
