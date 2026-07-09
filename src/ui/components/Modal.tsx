import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { PaperPanel } from './PaperPanel';
import './components.css';

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
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
      <div className="sp-modal" role="dialog" aria-modal="true">
        <PaperPanel assetSlot="panel.modal.background" {...(title !== undefined ? { title } : {})}>
          {children}
        </PaperPanel>
      </div>
    </div>
  );
}
