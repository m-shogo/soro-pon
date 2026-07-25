import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('AppRoot match session identity contract', () => {
  it('MatchSessionのReact keyは乱数seedではなく永続session IDを使う', () => {
    const source = readFileSync(new URL('./AppRoot.tsx', import.meta.url), 'utf8');

    expect(source).toContain('key={screen.matchSessionId}');
    expect(source).not.toContain('key={screen.seed}');
  });
});
