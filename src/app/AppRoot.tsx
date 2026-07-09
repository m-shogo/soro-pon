import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import starterRaw from '../../samples/animal-starter.deck.json';
import { createDeckTemplate } from './createdDeckTemplate';
import type { DeckProject } from '../domain/deck';
import type { MatchState } from '../domain/match';
import type { DeckValidationResult } from '../domain/validation';
import { parseDeckImport } from '../engine/import/parseDeckImport';
import { validateDeckProject } from '../engine/validation/validateDeckProject';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { createLocalStorageDeckStore } from '../storage/localStorageDeckStore';
import {
  buildMatchRecord,
  createLocalStorageRecordsStore,
} from '../storage/localStorageRecordsStore';
import { createLocalStorageSettingsStore } from '../storage/localStorageSettingsStore';
import { Badge } from '../ui/components/Badge';
import { Button } from '../ui/components/Button';
import { Modal } from '../ui/components/Modal';
import { useMatchController } from '../ui/hooks/useMatchController';
import { CollectionScreen } from '../ui/screens/CollectionScreen';
import { DeckDetailScreen } from '../ui/screens/DeckDetailScreen';
import { DeckEditorScreen } from '../ui/screens/DeckEditorScreen';
import { DeckListScreen } from '../ui/screens/DeckListScreen';
import { MatchScreen } from '../ui/screens/MatchScreen';
import { MatchSetupScreen } from '../ui/screens/MatchSetupScreen';
import { ResultScreen } from '../ui/screens/ResultScreen';
import { TopScreen } from '../ui/screens/TopScreen';

type Screen =
  | { kind: 'top' }
  | { kind: 'deckList' }
  | { kind: 'deckDetail'; deckId: string }
  | { kind: 'deckEditor'; deckId: string }
  | { kind: 'matchSetup'; deckId: string }
  | { kind: 'collection' }
  | { kind: 'match'; deckId: string; playerCount: 3 | 4; seed: number };

const OFFICIAL_STARTER_ID = 'official-animal-starter';

// 対局セッション。keyでremountしてcontrollerを初期化する。
function MatchSession({
  deck,
  playerCount,
  seed,
  insightMode,
  onExit,
  onRematch,
  onCollection,
  onResult,
}: {
  deck: DeckProject;
  playerCount: 3 | 4;
  seed: number;
  insightMode: 'beginner' | 'normal' | 'advanced';
  onExit: () => void;
  onRematch: () => void;
  onCollection: () => void;
  onResult: (state: MatchState) => number;
}) {
  const variant = deck.variants.find((v) => v.id === deck.activeVariantId)!;
  const controller = useMatchController({ deck, variant, playerCount, seed, insightMode });
  const recordedRef = useRef(false);
  const [coinsEarned, setCoinsEarned] = useState<number | null>(null);
  useEffect(() => {
    if (controller.state.phase === 'result' && !recordedRef.current) {
      recordedRef.current = true;
      setCoinsEarned(onResult(controller.state));
    }
  }, [controller.state, onResult]);
  if (controller.state.phase === 'result') {
    return (
      <ResultScreen
        deck={deck}
        state={controller.state}
        {...(coinsEarned !== null ? { coinsEarned } : {})}
        onRematch={onRematch}
        onBackToTop={onExit}
        onCollection={onCollection}
      />
    );
  }
  return <MatchScreen deck={deck} controller={controller} onExit={onExit} />;
}

export function AppRoot() {
  const deckStore = useMemo(
    () => createLocalStorageDeckStore(window.localStorage),
    [],
  );
  const settingsStore = useMemo(
    () => createLocalStorageSettingsStore(window.localStorage),
    [],
  );
  const recordsStore = useMemo(
    () => createLocalStorageRecordsStore(window.localStorage),
    [],
  );

  const [bootNotices] = useState<string[]>(() => {
    // 初回起動: 公式スターターを保存(strict parse経由)
    const { decks, issues } = deckStore.loadAll();
    if (!decks.some((d) => d.deck.id === OFFICIAL_STARTER_ID)) {
      const parsed = deckProjectSchema.safeParse(starterRaw);
      if (parsed.success) {
        deckStore.saveDeck(parsed.data, 'official');
      }
    }
    return issues.map((issue) => issue.message);
  });

  const [recordsVersion, setRecordsVersion] = useState(0);
  const records = useMemo(() => recordsStore.load().records, [recordsStore, recordsVersion]);
  const [decksVersion, setDecksVersion] = useState(0);
  const decks = useMemo(() => deckStore.loadAll().decks, [deckStore, decksVersion]);
  const settings = useMemo(() => settingsStore.load().settings, [settingsStore]);
  const refreshDecks = useCallback(() => setDecksVersion((v) => v + 1), []);

  const validations = useMemo(() => {
    const map = new Map<string, DeckValidationResult>();
    for (const stored of decks) {
      map.set(stored.deck.id, validateDeckProject({ deck: stored.deck }));
    }
    return map;
  }, [decks]);

  const [screen, setScreen] = useState<Screen>({ kind: 'top' });
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importIssues, setImportIssues] = useState<string[]>([]);

  const deckOf = (deckId: string): DeckProject | undefined =>
    decks.find((d) => d.deck.id === deckId)?.deck;

  const newSeed = () => Math.floor(Date.now() % 2147483647);

  const handleImport = () => {
    const result = parseDeckImport({ rawText: importText });
    if (!result.ok) {
      setImportIssues(result.issues.map((issue) => `${issue.code}: ${issue.message}`));
      return;
    }
    const validation = validateDeckProject({ deck: result.deck });
    deckStore.saveDeck(result.deck, 'imported');
    refreshDecks();
    setImportOpen(false);
    setImportText('');
    setImportIssues([]);
    if (result.migrationNotice) {
      setImportIssues([]);
    }
    setScreen({ kind: 'deckDetail', deckId: result.deck.id });
    void validation;
  };

  const handleExport = (deck: DeckProject) => {
    const text = deckStore.exportDeck(deck.id);
    if (text === null) {
      return;
    }
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${deck.id}.deck.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // 対局終了時の記録。人間勝利ならコイン=totalPoints(cap 500)、他は参加報酬。
  const recordMatch = useCallback(
    (finalState: MatchState): number => {
      const result = finalState.result;
      const deck = decks.find((d) => d.deck.id === finalState.deckProjectId)?.deck;
      if (!result || !deck) {
        return 0;
      }
      const winner = finalState.players.find((p) => p.id === result.winnerPlayerId);
      const humanWon = winner?.kind === 'human';
      const breakdown = result.breakdown;
      const record = buildMatchRecord({
        dateMs: Date.now(),
        deckId: deck.id,
        deckName: deck.name,
        reason: result.reason,
        winnerName: winner?.name ?? '',
        humanWon,
        ...(breakdown !== undefined
          ? {
              selectedWinRoleId: breakdown.selectedWinRoleId,
              selectedWinRoleName: breakdown.selectedWinRoleName,
              totalPoints: breakdown.totalPoints,
            }
          : {}),
      });
      const roleKey =
        humanWon && breakdown !== undefined
          ? `${deck.id}:${breakdown.selectedWinRoleId}`
          : undefined;
      recordsStore.addRecord(record, roleKey);
      setRecordsVersion((v) => v + 1);
      return record.coinsEarned;
    },
    [decks, recordsStore],
  );

  const importModal = (
    <Modal
      open={importOpen}
      title="デッキJSONを読み込む"
      onClose={() => {
        setImportOpen(false);
        setImportIssues([]);
      }}
    >
      <p style={{ marginTop: 0, fontSize: 'var(--sp-font-xs)' }}>
        共有デッキJSONを貼り付けてください。画像・URL・不明なフィールドを含むJSONは拒否されます。
      </p>
      <textarea
        rows={8}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        placeholder='{"version": 1, "id": "...", ...}'
      />
      {importIssues.length > 0 && (
        <ul className="sp-issue-list" style={{ marginTop: 'var(--sp-space-8)' }}>
          {importIssues.slice(0, 8).map((message, i) => (
            <li key={i}>
              <Badge variant="warning">拒否</Badge> {message}
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', gap: 'var(--sp-space-8)', marginTop: 'var(--sp-space-12)' }}>
        <Button variant="primary" onClick={handleImport} disabled={importText.trim() === ''}>
          読み込む
        </Button>
        <Button variant="ghost" onClick={() => setImportOpen(false)}>
          やめる
        </Button>
      </div>
    </Modal>
  );

  const renderScreen = () => {
    switch (screen.kind) {
      case 'top': {
        const starterValidation = validations.get(OFFICIAL_STARTER_ID);
        const playable =
          starterValidation?.status === 'playable' ||
          starterValidation?.status === 'playableWithWarnings';
        return (
          <TopScreen
            hasPlayableDeck={playable}
            onPlayNow={() => setScreen({ kind: 'matchSetup', deckId: OFFICIAL_STARTER_ID })}
            onDeckList={() => setScreen({ kind: 'deckList' })}
            onImport={() => setImportOpen(true)}
            onCollection={() => setScreen({ kind: 'collection' })}
            coins={records.coins}
            recentRecords={records.records.slice(0, 3)}
          />
        );
      }
      case 'deckList':
        return (
          <DeckListScreen
            decks={decks}
            validations={validations}
            onBack={() => setScreen({ kind: 'top' })}
            onSelect={(deckId) => setScreen({ kind: 'deckDetail', deckId })}
            onImport={() => setImportOpen(true)}
            onCreate={() => {
              const id = `created-${Date.now()}`;
              deckStore.saveDeck(createDeckTemplate(id, '新しいデッキ'), 'created');
              refreshDecks();
              setScreen({ kind: 'deckEditor', deckId: id });
            }}
          />
        );
      case 'deckDetail': {
        const deck = deckOf(screen.deckId);
        const validation = validations.get(screen.deckId);
        if (!deck || !validation) {
          return null;
        }
        return (
          <DeckDetailScreen
            deck={deck}
            validation={validation}
            onBack={() => setScreen({ kind: 'deckList' })}
            onStartSetup={() => setScreen({ kind: 'matchSetup', deckId: deck.id })}
            onEdit={() => setScreen({ kind: 'deckEditor', deckId: deck.id })}
            onExport={() => handleExport(deck)}
            onDelete={() => {
              deckStore.removeDeck(deck.id);
              refreshDecks();
              setScreen({ kind: 'deckList' });
            }}
          />
        );
      }
      case 'deckEditor': {
        const deck = deckOf(screen.deckId);
        if (!deck) {
          return null;
        }
        const source = decks.find((d) => d.deck.id === deck.id)?.source ?? 'created';
        return (
          <DeckEditorScreen
            deck={deck}
            onSave={(updated) => {
              deckStore.saveDeck(updated, source === 'official' ? 'created' : source);
              refreshDecks();
              setScreen({ kind: 'deckDetail', deckId: updated.id });
            }}
            onBack={() => setScreen({ kind: 'deckDetail', deckId: deck.id })}
          />
        );
      }
      case 'matchSetup': {
        const deck = deckOf(screen.deckId);
        const variant = deck?.variants.find((v) => v.id === deck.activeVariantId);
        if (!deck || !variant) {
          return null;
        }
        return (
          <MatchSetupScreen
            deck={deck}
            variant={variant}
            onBack={() => setScreen({ kind: 'top' })}
            onStart={(playerCount) =>
              setScreen({ kind: 'match', deckId: deck.id, playerCount, seed: newSeed() })
            }
          />
        );
      }
      case 'collection':
        return (
          <CollectionScreen
            records={records}
            decks={decks}
            onBack={() => setScreen({ kind: 'top' })}
          />
        );
      case 'match': {
        const deck = deckOf(screen.deckId);
        if (!deck) {
          return null;
        }
        return (
          <MatchSession
            key={screen.seed}
            deck={deck}
            playerCount={screen.playerCount}
            seed={screen.seed}
            insightMode={settings.insightMode}
            onResult={recordMatch}
            onCollection={() => setScreen({ kind: 'collection' })}
            onExit={() => setScreen({ kind: 'top' })}
            onRematch={() =>
              setScreen({
                kind: 'match',
                deckId: screen.deckId,
                playerCount: screen.playerCount,
                seed: newSeed(),
              })
            }
          />
        );
      }
    }
  };

  return (
    <>
      {renderScreen()}
      {importModal}
      {bootNotices.length > 0 && (
        <div className="sp-insight-strip" style={{ position: 'fixed', bottom: 8, left: 8 }}>
          {bootNotices.map((message, i) => (
            <span key={i} className="sp-insight-strip__item">
              {message}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
