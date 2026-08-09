import { useRef } from 'react';
import './components.css';

// 共通タブ(P1-3):
// - roving tabindex(activeのみTab順に入る)
// - Left/Right/Home/Endで移動(移動と同時に選択)
// - aria-controlsで対応するtabpanel(`sp-tabpanel-{id}`)と関連付ける
// - tab側に安定IDを持たせ、tabpanelがaria-labelledbyで逆参照できる
export function Tabs({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const moveTo = (index: number) => {
    const item = items[(index + items.length) % items.length];
    if (!item) {
      return;
    }
    onSelect(item.id);
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-tab-id="${item.id}"]`)
      ?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveTo(index + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveTo(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveTo(0);
        break;
      case 'End':
        event.preventDefault();
        moveTo(items.length - 1);
        break;
    }
  };

  return (
    <div className="sp-tabs" role="tablist" ref={listRef}>
      {items.map((item, index) => (
        <button
          key={item.id}
          id={`sp-tab-${item.id}`}
          type="button"
          role="tab"
          data-tab-id={item.id}
          aria-selected={item.id === activeId}
          aria-controls={`sp-tabpanel-${item.id}`}
          tabIndex={item.id === activeId ? 0 : -1}
          className={`sp-tab${item.id === activeId ? ' sp-tab--active' : ''}`}
          onClick={() => onSelect(item.id)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
