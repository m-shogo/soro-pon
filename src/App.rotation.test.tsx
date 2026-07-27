// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const testState = vi.hoisted(() => ({
  isPortrait: false,
  mountCount: 0,
}));

vi.mock('./ui/layout/useResponsiveMetrics', () => ({
  useResponsiveMetrics: () => ({
    width: testState.isPortrait ? 390 : 844,
    height: testState.isPortrait ? 844 : 390,
    density: 'compact',
    isPortrait: testState.isPortrait,
    tileWidth: 44,
    tileHeight: 59,
    tileGap: 4,
  }),
}));

vi.mock('./ui/skins/SkinProvider', () => ({
  SkinProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./app/AppRoot', async () => {
  const React = await import('react');
  return {
    AppRoot: () => {
      const [mountId] = React.useState(() => ++testState.mountCount);
      return <main data-testid="app-root" data-mount-id={mountId}>app</main>;
    },
  };
});

describe('App rotation lifecycle', () => {
  beforeEach(() => {
    testState.isPortrait = false;
    testState.mountCount = 0;
    window.location.hash = '';
  });

  it('portrait案内中もAppRootをunmountせず、landscape復帰時に画面状態を保つ', () => {
    const { rerender } = render(<App />);
    const mountId = screen.getByTestId('app-root').getAttribute('data-mount-id');

    testState.isPortrait = true;
    rerender(<App />);
    expect(document.querySelector('.sp-rotate-prompt')?.textContent).toContain(
      'soro-ponは横画面の遊びです。',
    );
    expect(screen.getByTestId('app-root').getAttribute('data-mount-id')).toBe(mountId);
    expect(screen.getByTestId('app-root').parentElement?.hasAttribute('inert')).toBe(true);

    testState.isPortrait = false;
    rerender(<App />);
    expect(document.querySelector('.sp-rotate-prompt')).toBeNull();
    expect(screen.getByTestId('app-root').getAttribute('data-mount-id')).toBe(mountId);
    expect(testState.mountCount).toBe(1);
  });
});
