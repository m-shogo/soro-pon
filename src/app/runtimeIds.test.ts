import { describe, expect, it } from 'vitest';
import { idSchema } from '../schemas/commonSchema';
import { newDeckProjectId } from './runtimeIds';

describe('newDeckProjectId', () => {
  it('共有JSONのID契約を満たすUUIDベースIDを返す', () => {
    const id = newDeckProjectId([], () => '123e4567-e89b-12d3-a456-426614174000');

    expect(id).toBe('created-123e4567-e89b-12d3-a456-426614174000');
    expect(idSchema.safeParse(id).success).toBe(true);
  });

  it('entropyが既存IDと衝突したら連番suffixで上書きを回避する', () => {
    const existing = [
      'created-fixed',
      'created-fixed-2',
      'created-fixed-3',
    ];

    expect(newDeckProjectId(existing, () => 'fixed')).toBe('created-fixed-4');
  });

  it('不正文字を除去し、suffix追加後も64文字上限を超えない', () => {
    const entropy = `${'a'.repeat(80)}:/unsafe`;
    const first = newDeckProjectId([], () => entropy);
    const second = newDeckProjectId([first], () => entropy);

    expect(first.length).toBeLessThanOrEqual(64);
    expect(second.length).toBeLessThanOrEqual(64);
    expect(idSchema.safeParse(first).success).toBe(true);
    expect(idSchema.safeParse(second).success).toBe(true);
    expect(second).not.toBe(first);
  });
});
