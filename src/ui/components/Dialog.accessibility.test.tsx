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
});
