import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import starterRaw from '../../samples/animal-starter.deck.json';
import {
  ACHIEVEMENTS,
  computeNewAchievements,
  type AchievementDef,
  type AchievementEvent,
} from './achievements';
import { createDeckTemplate } from './createdDeckTemplate';
import { buildMatchRecordingResult, newMatchSessionId } from './matchRecording';
import type { DeckProject } from '../domain/deck';
import type { MatchState } from '../domain/match';
import type { DeckValidationResult } from '../domain/validation';
import { parseDeckImport } from '../engine/import/parseDeckImport';
import { validateDeckProject } from '../engine/validation/validateDeckProject';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { StorageWriteError } from '../storage/keyValueStorage';
import { createLocalStorageDeckStore } from '../storage/localStorageDeckStore';
import { createLocalStorageRecordsStore } from '../storage/localStorageRecordsStore';
import { createLocalStorageSettingsStore } from '../storage/localStorageSettingsStore';
import { Badge } from '../ui/components/Badge';
import { Button } from '../ui/components/Button';
import { TextField } from '../ui/components/FormField';
import { Modal } from '../ui/components/Modal';
import { Toast } from '../ui/components/Toast';
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
  | {
      kind: 'match';
      deckId: string;
      playerCount: 3 | 4;
      seed: number;
      /** 対局開始時に発行するセッションID。記録の冪等キーに使う(P2-4) */
      matchSessionId: string;
    };

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
  onResult: (state: MatchState) => { coinsEarned: number; newlyUnlocked: AchievementDef[] };
}) {
  const variant = deck.variants.find((v) => v.id === deck.activeVariantId)!;
  const controller = useMatchController({ deck, variant, playerCount, seed, insightMode });
  const recordedRef = useRef(false);
  const [resultReward, setResultReward] = useState<{
    coinsEarned: number;
    newlyUnlocked: AchievementDef[];
  } | null>(null);
  useEffect(() => {
    if (controller.state.phase === 'result' && !recordedRef.current) {
      recordedRef.current = true;
      setResultReward(onResult(controller.state));
    }
  }, [controller.state, onResult]);
  if (controller.state.phase === 'result') {
    return (
      <ResultScreen
        deck={deck}
        state={controller.state}
        {...(resultReward !== null
          ? {
              coinsEarned: resultReward.coinsEarned,
              newlyUnlocked: resultReward.newlyUnlocked,
            }
          : {})}
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

  // 保存系書き込みをquota超過等から安全に包む(Gate 6 storage recovery)。
  // 失敗時は生のDOMExceptionをそのまま投げず、理解可能な通知として
  // saveNoticesへ積み、falseを返す。呼び出し側はfalseなら「保存された前提の
  // 後続処理(画面遷移やdirty解除)」を行わない。
  const [saveNotices, setSaveNotices] = useState<string[]>([]);
  const tryWrite = useCallback((fn: () => void): boolean => {
    try {
      fn();
      return true;
    } catch (err) {
      if (err instanceof StorageWriteError) {
        setSaveNotices((prev) => [...prev, err.message]);
        return false;
      }
      throw err;
    }
  }, []);

  const [bootNotices] = useState<string[]>(() => {
    // 初回起動: 公式スターターを保存(strict parse経由)
    const { decks, issues } = deckStore.loadAll();
    if (!decks.some((d) => d.deck.id === OFFICIAL_STARTER_ID)) {
      const parsed = deckProjectSchema.safeParse(starterRaw);
      if (parsed.success) {
        try {
          deckStore.saveDeck(parsed.data, 'official');
        } catch (err) {
          if (err instanceof StorageWriteError) {
            issues.push({ code: 'L9002', severity: 'warning', message: err.message });
          } else {
            throw err;
          }
        }
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

  // 実績評価: eventを渡して新規解放を保存し、解放された定義を返す
  const processAchievements = useCallback(
    (event: AchievementEvent): AchievementDef[] => {
      const current = recordsStore.load().records;
      const gained = computeNewAchievements(current.achievements ?? [], event, current);
      if (gained.length > 0) {
        if (tryWrite(() => recordsStore.unlockAchievements(gained))) {
          setRecordsVersion((v) => v + 1);
        }
      }
      return ACHIEVEMENTS.filter((a) => gained.includes(a.id));
    },
    [recordsStore, tryWrite],
  );

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

  // MatchSessionはkey={seed}でマウント管理されるため、seedは対局ごとに一意である必要がある。
  // Date.now()だけだと同一ミリ秒(高速な「もう一局」連打)で衝突しうるため、
  // セッション内で単調増加するカウンタを混ぜて衝突を防ぐ。
  const seedCounterRef = useRef(0);
  const newSeed = useCallback(() => {
    seedCounterRef.current += 1;
    return (Math.floor(Date.now() % 1000000) * 1000 + (seedCounterRef.current % 1000)) % 2147483647;
  }, []);

  const handleImport = () => {
    const result = parseDeckImport({ rawText: importText });
    if (!result.ok) {
      setImportIssues(result.issues.map((issue) => `${issue.code}: ${issue.message}`));
      return;
    }
    const validation = validateDeckProject({ deck: result.deck });
    if (!tryWrite(() => deckStore.saveDeck(result.deck, 'imported'))) {
      // 保存に失敗した場合はimport modalを開いたままにし、入力内容も失わない。
      return;
    }
    refreshDecks();
    processAchievements({ type: 'deckImported' });
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
    processAchievements({ type: 'deckExported' });
  };

  // 対局終了時の記録。決着の組み立ては純関数(matchRecording.ts)に委譲し、
  // storage層のmatchKey冪等性で同じ結果の二重加算を防ぐ(結果確定イベント単位で一度だけ)。
  const recordMatch = useCallback(
    (
      finalState: MatchState,
      matchSessionId?: string,
    ): { coinsEarned: number; newlyUnlocked: AchievementDef[] } => {
      const stored = decks.find((d) => d.deck.id === finalState.deckProjectId);
      if (!stored) {
        return { coinsEarned: 0, newlyUnlocked: [] };
      }
      const built = buildMatchRecordingResult({
        finalState,
        deck: stored.deck,
        deckSource: stored.source,
        ...(matchSessionId !== undefined ? { matchSessionId } : {}),
      });
      if (!built) {
        return { coinsEarned: 0, newlyUnlocked: [] };
      }
      if (!tryWrite(() => recordsStore.addRecord(built.record, built.matchKey, built.roleKey))) {
        // 保存に失敗しても対局結果画面自体はin-memory stateから描画できるため、
        // Result画面を止めない。コイン/実績だけが保存されない。
        return { coinsEarned: 0, newlyUnlocked: [] };
      }
      setRecordsVersion((v) => v + 1);
      const newlyUnlocked = processAchievements(built.achievementEvent);
      return { coinsEarned: built.record.coinsEarned, newlyUnlocked };
    },
    [decks, recordsStore, processAchievements, tryWrite],
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
      <TextField
        label="デッキJSON"
        multiline
        rows={8}
        width="100%"
        monospace
        value={importText}
        onChange={setImportText}
        placeholder='{"version": 1, "id": "...", ...}'
      />
      {importIssues.length > 0 && (
        <ul
          className="sp-issue-list"
          style={{ marginTop: 'var(--sp-space-8)' }}
          role="status"
          aria-live="polite"
        >
          {importIssues.slice(0, 8).map((message, i) => (
            <li key={i}>
              <Badge variant="warning">拒否</Badge> {message}
            </li>
          ))}
        </ul>
      )}
      <div className="sp-dialog__actions">
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
              if (!tryWrite(() => deckStore.saveDeck(createDeckTemplate(id, '新しいデッキ'), 'created'))) {
                return;
              }
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
              if (!tryWrite(() => deckStore.removeDeck(deck.id))) {
                return;
              }
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
              const saveSource = source === 'official' ? 'created' : source;
              if (!tryWrite(() => deckStore.saveDeck(updated, saveSource))) {
                // 保存に失敗した場合はDeckEditorに留まり、draftを失わせない。
                return;
              }
              refreshDecks();
              const savedValidation = validateDeckProject({ deck: updated });
              processAchievements({
                type: 'deckSaved',
                source: saveSource,
                hasWarnings: savedValidation.issues.length > 0,
              });
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
            onStart={(playerCount) => {
              if (decks.find((d) => d.deck.id === deck.id)?.source === 'created') {
                processAchievements({ type: 'matchStartedWithCreatedDeck' });
              }
              setScreen({
                kind: 'match',
                deckId: deck.id,
                playerCount,
                seed: newSeed(),
                matchSessionId: newMatchSessionId(),
              });
            }}
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
            onResult={(finalState) => recordMatch(finalState, screen.matchSessionId)}
            onCollection={() => setScreen({ kind: 'collection' })}
            onExit={() => setScreen({ kind: 'top' })}
            onRematch={() =>
              setScreen({
                kind: 'match',
                deckId: screen.deckId,
                playerCount: screen.playerCount,
                seed: newSeed(),
                matchSessionId: newMatchSessionId(),
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
      <Toast messages={bootNotices} tone="warning" />
      <Toast messages={saveNotices} tone="warning" />
    </>
  );
}
