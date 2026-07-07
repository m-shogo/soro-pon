// engineはMath.randomを直接使わない。seedからの決定的RNGのみ。
// replayはseed + action列から再構築できる。

export type Rng = {
  /** [0, 1) の乱数 */
  next(): number;
  /** [0, maxExclusive) の整数 */
  nextInt(maxExclusive: number): number;
};

// mulberry32: 小さく決定的で十分な品質のPRNG
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    nextInt(maxExclusive: number): number {
      if (maxExclusive <= 0) {
        return 0;
      }
      return Math.floor(next() * maxExclusive);
    },
  };
}

// Fisher-Yates。入力を変更せず新しい配列を返す。
export function shuffleWithRng<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}
