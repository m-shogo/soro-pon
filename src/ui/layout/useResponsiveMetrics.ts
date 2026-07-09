import { useEffect, useState } from 'react';

export type DensityMode = 'compact' | 'normal' | 'wide' | 'desktop';

export type ResponsiveMetrics = {
  width: number;
  height: number;
  density: DensityMode;
  isPortrait: boolean;
  /** 整数px。牌がにじまないようfloorで丸める */
  tileWidth: number;
  tileHeight: number;
  tileGap: number;
};

export function computeMetrics(width: number, height: number): ResponsiveMetrics {
  const isPortrait = height > width;
  let density: DensityMode;
  if (width >= 1200) {
    density = 'desktop';
  } else if (width >= 980) {
    density = 'wide';
  } else if (width >= 820) {
    density = 'normal';
  } else {
    density = 'compact';
  }
  // 手牌9枚 + 余白が横に収まり、かつ高さの22%を超えないサイズ
  const byHeight = Math.floor(Math.min(height * 0.22, 96));
  const byWidth = Math.floor((width * 0.62) / 9 / 0.75);
  const tileHeight = Math.max(44, Math.min(byHeight, byWidth));
  const tileWidth = Math.floor(tileHeight * 0.75);
  const tileGap = Math.max(3, Math.floor(tileWidth * 0.1));
  return { width, height, density, isPortrait, tileWidth, tileHeight, tileGap };
}

export function useResponsiveMetrics(): ResponsiveMetrics {
  const [metrics, setMetrics] = useState<ResponsiveMetrics>(() =>
    computeMetrics(window.innerWidth, window.innerHeight),
  );
  useEffect(() => {
    const onResize = () => {
      setMetrics(computeMetrics(window.innerWidth, window.innerHeight));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return metrics;
}
