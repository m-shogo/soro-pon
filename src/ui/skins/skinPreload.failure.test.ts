import { afterEach, describe, expect, it, vi } from 'vitest';
import { preloadImages } from './skinPreload';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('preloadImages failure safety', () => {
  it('Image constructorが例外でもrejectせずfalseを返す', async () => {
    vi.stubGlobal(
      'Image',
      class {
        constructor() {
          throw new Error('image unavailable');
        }
      },
    );

    await expect(preloadImages(['/broken.png'])).resolves.toBe(false);
  });

  it('src代入が同期例外でもrejectせずfalseを返す', async () => {
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        set src(_value: string) {
          throw new Error('source rejected');
        }
      },
    );

    await expect(preloadImages(['/broken.png'])).resolves.toBe(false);
  });
});
