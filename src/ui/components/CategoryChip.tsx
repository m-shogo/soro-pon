import type { CSSProperties } from 'react';
import './components.css';

export function CategoryChip({
  name,
  color,
  icon,
}: {
  name: string;
  color: string;
  icon?: string;
}) {
  return (
    <span className="sp-category-chip" style={{ '--chip-color': color } as CSSProperties}>
      <span className="sp-category-chip__dot" aria-hidden="true" />
      {icon !== undefined && <span aria-hidden="true">{icon}</span>}
      {name}
    </span>
  );
}
