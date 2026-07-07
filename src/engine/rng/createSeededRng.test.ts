import { describe, expect, it } from 'vitest';
import { createSeededRng, shuffleWithRng } from './createSeededRng';

describe('createSeededRng', () => {
  it('同じseedは同じ乱数列を生む', () => {
    const a = createSeededRng(42);
    const b = createSeededRng(42);
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it('違うseedは違う列を生む', () => {
    const a = createSeededRng(1);
    const b = createSeededRng(2);
    expect([a.next(), a.next()]).not.toEqual([b.next(), b.next()]);
  });

  it('nextIntは範囲内の整数を返す', () => {
    const rng = createSeededRng(7);
    for (let i = 0; i < 100; i++) {
      const v = rng.nextInt(5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('shuffleWithRngは決定的で入力を変更しない', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const frozen = [...input];
    const outA = shuffleWithRng(input, createSeededRng(99));
    const outB = shuffleWithRng(input, createSeededRng(99));
    expect(outA).toEqual(outB);
    expect(input).toEqual(frozen);
    expect([...outA].sort((x, y) => x - y)).toEqual(frozen);
  });
});
