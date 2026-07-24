import { useId } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import './components.css';

// 確認ダイアログの共通形。中断/離脱/削除などの危険操作はこれを使う。
// 画面ごとに確認モーダルを再実装しない。
export function Dialog({
  open,
  title,
  message,
  children,
  confirmLabel,
  cancelLabel = 'やめる',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: ReactNode;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      title={title}
      {...(message !== undefined ? { ariaDescribedBy: descriptionId } : {})}
      onClose={onCancel}
    >
      {message !== undefined && (
        <p id={descriptionId} style={{ marginTop: 0, fontSize: 'var(--sp-font-sm)' }}>
          {message}
        </p>
      )}
      {children}
      <div className="sp-dialog__actions">
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}
