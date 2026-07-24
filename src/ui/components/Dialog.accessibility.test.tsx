// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Dialog } from './Dialog';

afterEach(cleanup);

describe('Dialog accessibility relationship', () => {
  it('重要な確認本文をaria-describedbyでdialogへ関連付ける', () => {
    render(
      <Dialog
        open
        title="デッキを削除"
        message="この操作は取り消せません。"
        confirmLabel="削除する"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'デッキを削除' });
    const descriptionId = dialog.getAttribute('aria-describedby');

    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId ?? '')?.textContent).toBe(
      'この操作は取り消せません。',
    );
  });

  it('danger dialogは確認ではなくキャンセルへ初期フォーカスする', () => {
    render(
      <Dialog
        open
        danger
        title="デッキを削除"
        message="この操作は取り消せません。"
        confirmLabel="削除する"
        cancelLabel="やめる"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'やめる' }));
  });

  it('通常dialogは従来どおり確認操作へ初期フォーカスする', () => {
    render(
      <Dialog
        open
        title="設定を適用"
        confirmLabel="適用する"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(document.activeElement).toBe(screen.getByRole('button', { name: '適用する' }));
  });
});
