import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const headers = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');

describe('Cloudflare Pages headers', () => {
  it('keeps hashed Vite assets immutable', () => {
    expect(headers).toContain('/assets/*');
    expect(headers).toContain('Cache-Control: public, max-age=31536000, immutable');
  });

  it('sets the static-app security boundary without enabling eval', () => {
    expect(headers).toContain("default-src 'self'");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("object-src 'none'");
    expect(headers).toContain("style-src 'self' 'unsafe-inline'");
    expect(headers).not.toContain("'unsafe-eval'");
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain('X-Frame-Options: DENY');
  });
});
