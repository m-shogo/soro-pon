import { useEffect, useState } from 'react';
// layer順序宣言を必ず最初に読み込む(P1-7)
import './ui/styles/layers.css';
import './ui/styles/tokens.css';
import './ui/styles/base.css';
import './ui/styles/layout.css';
import './ui/styles/match-polish.css';
import './ui/styles/match-river-polish.css';
import './ui/styles/deck-polish.css';
import './ui/styles/deck-editor-polish.css';
import './ui/styles/authored-visual-polish.css';
import './ui/styles/deck-editor-authored-workspace.css';
import './ui/styles/deck-browser-authored-workspace.css';
import './ui/styles/batch14-landscape-game.css';
import './ui/styles/deck-role-composer.css';
import './ui/styles/screens.css';
import './ui/styles/motion.css';
import { AppRoot } from './app/AppRoot';
import { AppErrorBoundary } from './ui/components/AppErrorBoundary';
import { SkinProvider } from './ui/skins/SkinProvider';
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

  return (
    <SkinProvider>
      <div className="sp-game-shell" data-density={metrics.density}>
        <div
          className="sp-game-safe-area"
          aria-hidden={metrics.isPortrait || undefined}
          inert={metrics.isPortrait || undefined}
        >
          <AppErrorBoundary>
            {hash === '#/gallery' ? <ComponentGallery /> : <AppRoot />}
          </AppErrorBoundary>
        </div>
        {metrics.isPortrait ? <RotatePrompt /> : null}
      </div>
    </SkinProvider>
  );
}