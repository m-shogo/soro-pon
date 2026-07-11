import type { ReactNode } from 'react';
import './components.css';

// フォーム部品の共通実装。画面側で生のinput/select/textareaを直接書かない。
// 見た目はtokens、レイアウトは共通クラスで管理する。

export function FormField({
  label,
  inline = false,
  children,
}: {
  label: string;
  inline?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`sp-field${inline ? ' sp-field--inline' : ''}`}>
      <span className="sp-field__label">{label}</span>
      {children}
    </label>
  );
}

export function TextField({
  value,
  onChange,
  label,
  maxLength,
  placeholder,
  multiline = false,
  rows = 2,
  width,
  monospace = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  maxLength?: number;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  width?: string;
  monospace?: boolean;
}) {
  const style = {
    ...(width !== undefined ? { width } : {}),
    ...(monospace ? { fontFamily: 'monospace' } : {}),
  };
  if (multiline) {
    return (
      <textarea
        aria-label={label}
        rows={rows}
        {...(maxLength !== undefined ? { maxLength } : {})}
        {...(placeholder !== undefined ? { placeholder } : {})}
        value={value}
        style={style}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      type="text"
      aria-label={label}
      {...(maxLength !== undefined ? { maxLength } : {})}
      {...(placeholder !== undefined ? { placeholder } : {})}
      value={value}
      style={style}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// 整数のみ・範囲内のみをonChangeへ流す(エディタで重複していたガードを共通化)
export function NumberField({
  value,
  onChange,
  label,
  min,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min: number;
  max: number;
}) {
  return (
    <input
      type="number"
      aria-label={label}
      min={min}
      max={max}
      value={value}
      onChange={(e) => {
        const next = Number.parseInt(e.target.value, 10);
        if (Number.isInteger(next) && next >= min && next <= max) {
          onChange(next);
        }
      }}
    />
  );
}

export function SelectField({
  value,
  onChange,
  label,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// カテゴリ色などのカラーピッカー。値は#rrggbbのみ。
export function ColorField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <input
      type="color"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="sp-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
