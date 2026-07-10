// 検証済みtoken集合から:root宣言のCSSテキストを組み立てる(純関数)。
// 値はparseSkinTokensで検証済みのため、ここでの再エスケープは不要だが、
// 多層防御として改行・波括弧を含む値は落とす。
export function buildTokensStyleText(tokens: Record<string, string>): string {
  const lines: string[] = [];
  for (const [name, value] of Object.entries(tokens)) {
    if (!/^--sp-[a-z0-9-]+$/.test(name)) {
      continue;
    }
    if (/[{};\n]/.test(value)) {
      continue;
    }
    lines.push(`  ${name}: ${value};`);
  }
  return `:root {\n${lines.join('\n')}\n}`;
}
