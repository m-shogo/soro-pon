import { useEffect, useState } from 'react';
import './ui/styles/tokens.css';
import './ui/styles/base.css';
import { AssetProvider } from './ui/assets/AssetProvider';
import { useResponsiveMetrics } from './ui/layout/useResponsiveMetrics';
import { RotatePrompt } from './ui/components/RotatePrompt';
import { ComponentGallery } from './ui/gallery/ComponentGallery';

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function App() {
  const metrics = useResponsiveMetrics();
  const hash = useHashRoute();

  if (metrics.isPortrait) {
    return <RotatePrompt />;
  }

  return (
    <AssetProvider>
      <div className="sp-game-shell" data-density={metrics.density}>
        <div className="sp-game-safe-area">
          {hash === '#/gallery' ? <ComponentGallery /> : <ComponentGallery />}
        </div>
      </div>
    </AssetProvider>
  );
}
