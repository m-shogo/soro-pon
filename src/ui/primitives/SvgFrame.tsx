import './primitives.css';

// 拡大してもボケない枠線。ボタン/牌/パネルの縁に重ねる。
// strokeはnon-scaling-strokeで太さを保つ。
export function SvgFrame({
  radius = 6,
  color = 'currentColor',
  strokeWidth = 1.5,
  inset = 2,
  doubleLine = false,
}: {
  radius?: number;
  color?: string;
  strokeWidth?: number;
  inset?: number;
  doubleLine?: boolean;
}) {
  return (
    <svg className="sp-svg-frame" aria-hidden="true">
      <rect
        x={inset}
        y={inset}
        width={`calc(100% - ${inset * 2}px)`}
        height={`calc(100% - ${inset * 2}px)`}
        rx={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      {doubleLine && (
        <rect
          x={inset + 3}
          y={inset + 3}
          width={`calc(100% - ${(inset + 3) * 2}px)`}
          height={`calc(100% - ${(inset + 3) * 2}px)`}
          rx={Math.max(2, radius - 2)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 0.6}
          opacity={0.5}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
