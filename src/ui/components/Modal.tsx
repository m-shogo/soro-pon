import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { PaperPanel } from './PaperPanel';
import './components.css';

const FOCUSABLE_SELECTOR =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// 共通モーダル(P1-3):
// - 開いたら最初のフォーカス可能要素へ移動
// - Tab/Shift+Tabはモーダル内で循環(focus trap)
// - Escapeで閉じる
// - 閉じたら開く前の要素へフォーカスを戻す
export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // 初期フォーカス: モーダル内の最初のフォーカス可能要素(なければ本体)
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? dialog)?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) {
        return;
      }
      // focus trap: モーダル内で循環させる
      const focusables = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const firstEl = focusables[0]!;
      const lastEl = focusables[focusables.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === firstEl || !dialog.contains(active))) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && (active === lastEl || !dialog.contains(active))) {
        event.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }
  return (
    <div
      className="sp-modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="sp-modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        {...(title !== undefined ? { 'aria-labelledby': titleId } : {})}
      >
        <PaperPanel
          assetSlot="panel.modal.background"
          {...(title !== undefined ? { title: <span id={titleId}>{title}</span> } : {})}
        >
          {children}
        </PaperPanel>
      </div>
    </div>
  );
}
