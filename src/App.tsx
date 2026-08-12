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
import './ui/styles/result-authored-workspace.css';
import './ui/styles/match-setup-authored.css';
import './ui/styles/collection-authored.css';
import './ui/styles/batch14-landscape-game.css';
import './ui/styles/desktop-match-stage.css';
import './ui/styles/match-coach.css';
import './ui/styles/deck-role-workbench.css';
import './ui/styles/interaction-ux.css';
import './ui/styles/screens.css';
import './ui/styles/compact-opponent-seat-tags.css';
import './ui/styles/match-setup-seat-plaques.css';
import './ui/styles/desktop-authored-shell.css';
import './ui/styles/home-loadout-stage.css';
import './ui/styles/desktop-top-stage.css';
import './ui/styles/top-menu-rail.css';
import './ui/styles/desktop-top-index.css';
import './ui/styles/deck-detail-stage.css';
import './ui/styles/deck-tile-workbench.css';
import './ui/styles/deck-category-workbench.css';
import './ui/styles/deck-bonus-workbench.css';
import './ui/styles/deck-editor-adaptive-inspector.css';
import './ui/styles/deck-editor-compact-inspector-rail.css';
import './ui/styles/deck-basic-ledger.css';
import './ui/styles/collection-ledger-stage.css';
import './ui/styles/collection-stamp-index.css';
import './ui/styles/collection-empty-score-ledger.css';
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
