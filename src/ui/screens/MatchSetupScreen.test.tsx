// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DeckProject } from '../../domain/deck';
import type { DeckVariant } from '../../domain/variant';
import { MatchSetupScreen } from './MatchSetupScreen';

afterEach(cleanup);

function buildSetup(playerCounts: Array<3 | 4> = [3, 4]) {
  const deck = {
    name: '動物スターター',
    tiles: [{ count: 36 }],
  } as unknown as DeckProject;
  const variant = {
    id: 'normal',
    name: '通常版',
    ruleConfig: {
      supportedPlayerCounts: playerCounts,
      handSizeNormal: 8,
    },
  } as unknown as DeckVariant;
  return { deck, variant };
}

describe('MatchSetupScreen interaction UX', () => {
  it('人数変更を参加者・ルール概要・開始CTAへ即時反映する', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const { deck, variant } = buildSetup();

    render(
      <MatchSetupScreen
        deck={deck}
        variant={variant}
        onStart={onStart}
        onBack={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: '3人戦' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '3人戦をはじめる' })).toBeTruthy();
    expect(screen.getByText('12枚')).toBeTruthy();
    expect(screen.getByText('3席')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '4人戦' }));

    expect(screen.getByRole('button', { name: '4人戦' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '4人戦をはじめる' })).toBeTruthy();
    expect(screen.getByText('4枚')).toBeTruthy();
    expect(screen.getByText('4席')).toBeTruthy();
    expect(screen.getByText('ミチル')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '4人戦をはじめる' }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(4);
  });

  it('未対応人数は選べず、開始CTAは対応人数のまま保つ', () => {
    const { deck, variant } = buildSetup([3]);

    render(
      <MatchSetupScreen
        deck={deck}
        variant={variant}
        onStart={() => {}}
        onBack={() => {}}
      />,
    );

    expect((screen.getByRole('button', { name: '4人戦' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('button', { name: '3人戦をはじめる' })).toBeTruthy();
  });
});
