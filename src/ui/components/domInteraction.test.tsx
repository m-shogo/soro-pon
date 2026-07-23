// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import type { DeckVariant } from '../../domain/variant';
import { MatchSetupScreen } from '../screens/MatchSetupScreen';
import { applyDocumentSkin } from '../skins/skinDom';
import { AppErrorBoundary } from './AppErrorBoundary';
import { Button } from './Button';
import { Modal } from './Modal';
import { Tabs } from './Tab';
import { TileCard } from './TileCard';

// P1-1/P1-3: DOMが必要なフォーカス・キーボード・aria状態のテスト。
// engine/schemaテストはnode環境のまま(ADR-013)。

afterEach(cleanup);

describe('MatchSetupScreen: 人数選択状態', () => {
  const variant = {
    id: 'normal',
    name: '通常版',
    label: '通常版',
    ruleConfig: {
      supportedPlayerCounts: [3, 4],
      handSizeNormal: 8,
    },
  } as unknown as DeckVariant;
  const deck = {
    name: '動物スターター',
    tiles: [{ count: 36 }],
  } as unknown as DeckProject;

  it('現在の人数をaria-pressedで伝え、選択変更に追従する', async () => {
    const user = userEvent.setup();
    render(
      <MatchSetupScreen
        deck={deck}
        variant={variant}
        onStart={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const threePlayers = screen.getByRole('button', { name: '3人戦' });
    const fourPlayers = screen.getByRole('button', { name: '4人戦' });
    expect(threePlayers.getAttribute('aria-pressed')).toBe('true');
    expect(fourPlayers.getAttribute('aria-pressed')).toBe('false');

    await user.click(fourPlayers);
    expect(threePlayers.getAttribute('aria-pressed')).toBe('false');
    expect(fourPlayers.getAttribute('aria-pressed')).toBe('true');
  });
});

function ModalHarness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        開く
      </button>
      <Modal open={open} title="テスト" onClose={() => setOpen(false)}>
        <button type="button">中1</button>
        <button type="button">中2</button>
      </Modal>
    </div>
  );
}

describe('Modal: focus管理(P1-3)', () => {
  it('開くと中の最初の要素へフォーカスし、閉じると呼び出し元へ戻る', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    const opener = screen.getByRole('button', { name: '開く' });
    await user.click(opener);
    expect(screen.getByRole('dialog')).toHaveProperty('ariaModal', 'true');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '中1' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('Tabがモーダル内で循環する(focus trap)', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    await user.click(screen.getByRole('button', { name: '開く' }));
    const inner1 = screen.getByRole('button', { name: '中1' });
    const inner2 = screen.getByRole('button', { name: '中2' });
    inner2.focus();
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(inner1);
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(inner2);
  });

  it('titleがaria-labelledbyで関連付く', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    await user.click(screen.getByRole('button', { name: '開く' }));
    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toBe('テスト');
  });
});

function TabsHarness() {
  const [active, setActive] = useState('a');
  return (
    <Tabs
      items={[
        { id: 'a', label: 'あ' },
        { id: 'b', label: 'い' },
        { id: 'c', label: 'う' },
      ]}
      activeId={active}
      onSelect={setActive}
    />
  );
}

describe('Tabs: キーボード操作(P1-3)', () => {
  it('activeのみtabIndex 0(roving tabindex)', () => {
    render(<TabsHarness />);
    expect(screen.getByRole('tab', { name: 'あ' }).tabIndex).toBe(0);
    expect(screen.getByRole('tab', { name: 'い' }).tabIndex).toBe(-1);
  });

  it('矢印/Home/Endで移動し選択とフォーカスが追従する', async () => {
    const user = userEvent.setup();
    render(<TabsHarness />);
    const first = screen.getByRole('tab', { name: 'あ' });
    first.focus();
    await user.keyboard('{ArrowRight}');
    const second = screen.getByRole('tab', { name: 'い' });
    expect(second.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(second);
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'う' }).getAttribute('aria-selected')).toBe('true');
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'あ' }).getAttribute('aria-selected')).toBe('true');
    // 左端からArrowLeftで末尾へ循環
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'う' }).getAttribute('aria-selected')).toBe('true');
  });

  it('aria-controlsがtabpanel idを指す', () => {
    render(<TabsHarness />);
    expect(screen.getByRole('tab', { name: 'あ' }).getAttribute('aria-controls')).toBe(
      'sp-tabpanel-a',
    );
  });
});

describe('TileCard: 状態のアクセシビリティ(P1-3)', () => {
  it('selectedはaria-pressedで伝わる', () => {
    render(<TileCard name="オオカミ" fallbackLabel="狼" selected />);
    expect(
      screen.getByRole('button', { name: 'オオカミ' }).getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('ロン/ツモ強調は文言でも伝わる(色だけに依存しない)', () => {
    render(<TileCard name="コウモリ" fallbackLabel="蝙" emphasis="ron" />);
    expect(screen.getByRole('button', { name: 'コウモリ(ロンできる)' })).toBeTruthy();
  });
});

describe('skin切り替えとDOM状態(P1-1)', () => {
  it('applyDocumentSkinしてもdisabled/selected状態のDOMが変わらない', () => {
    render(
      <div>
        <Button variant="primary" disabled>
          捨てる
        </Button>
        <TileCard name="ネコ" fallbackLabel="猫" selected />
      </div>,
    );
    const before = {
      disabled: (screen.getByRole('button', { name: '捨てる' }) as HTMLButtonElement).disabled,
      pressed: screen.getByRole('button', { name: 'ネコ' }).getAttribute('aria-pressed'),
    };
    applyDocumentSkin(
      'cute-pop',
      { '--sp-color-night': '#fff3e2' },
      { colorScheme: 'light', themeColor: '#fff3e2' },
    );
    expect(document.documentElement.dataset['skin']).toBe('cute-pop');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(
      (document.getElementById('sp-theme-color') as HTMLMetaElement | null)?.content,
    ).toBe('#fff3e2');
    expect(
      (screen.getByRole('button', { name: '捨てる' }) as HTMLButtonElement).disabled,
    ).toBe(before.disabled);
    expect(screen.getByRole('button', { name: 'ネコ' }).getAttribute('aria-pressed')).toBe(
      before.pressed,
    );
  });
});

describe('AppErrorBoundary: 復旧経路(P1-4)', () => {
  it('描画エラーで白画面にせずエラー表示と復旧ボタンを出す', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Boom(): never {
      throw new Error('boom');
    }
    render(
      <AppErrorBoundary>
        <Boom />
      </AppErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: '再読み込みする' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'ローカルデータを初期化…' })).toBeTruthy();
    spy.mockRestore();
  });
});
