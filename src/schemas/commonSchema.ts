import { z } from 'zod';

// IDは共有JSONの安全な移植性のため文字種を制限する。
export const idSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, 'IDは英数字と-_のみ使用できます');

export const displayNameSchema = z.string().min(1).max(80);

export const tagSchema = z.string().min(1).max(40);

export const explanationSchema = z.string().min(1).max(300);

export const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'colorは#RRGGBB形式のみ使用できます');

// 絵文字/短い記号のみ。URLやマークアップは長さ制限で排除する。
export const shortGlyphSchema = z.string().min(1).max(8);
