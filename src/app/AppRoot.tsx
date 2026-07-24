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

  const [saveNotices, setSaveNotices] = useState<string[]>([]);
  const appendSaveNotice = useCallback((message: string) => {
    setSaveNotices((prev) => {
      if (prev.at(-1) === message) {
        return prev;
      }
      return [...prev, message].slice(-5);
    });
  }, []);

  // 保存系書き込みをquota超過等から安全に包む。
  // falseなら呼び出し側は保存成功前提の遷移・表示を行わない。
  const tryWrite = useCallback(
    (fn: () => void): boolean => {
      try {
        fn();
        return true;
      } catch (err) {
        if (err instanceof StorageWriteError) {
          appendSaveNotice(err.message);
          return false;
        }
        throw err;
      }
    },
    [appendSaveNotice],
  );

  const [bootNotices] = useState<string[]>(() => {
    const deckLoad = deckStore.loadAll();
    const recordsLoad = recordsStore.load();
    const settingsLoad = settingsStore.load();
    const issues = [...deckLoad.issues, ...recordsLoad.issues, ...settingsLoad.issues];

    // 初回起動: 公式スターターを保存(strict parse経由)。
    if (!deckLoad.decks.some((d) => d.deck.id === OFFICIAL_STARTER_ID)) {
      const parsed = deckProjectSchema.safeParse(starterRaw);
      if (parsed.success) {
        try {
          deckStore.saveDeck(parsed.data, 'official');
        } catch (err) {
          if (err instanceof StorageWriteError) {
            issues.push({ code: 'L9006', severity: 'warning', message: err.message });
          } else {
            throw err;
          }
        }
      }
    }

    return [...new Set(issues.map((issue) => issue.message))];
  });

  const [recordsVersion, setRecordsVersion] = useState(0);
  const records = useMemo(() => recordsStore.load().records, [recordsStore, recordsVersion]);
  const [decksVersion, setDecksVersion] = useState(0);
  const decks = useMemo(() => deckStore.loadAll().decks, [deckStore, decksVersion]);
  const settings = useMemo(() => settingsStore.load().settings, [settingsStore]);
  const refreshDecks = useCallback(() => setDecksVersion((v) => v + 1), []);

  // 実績は永続化に成功した場合だけ「新規解放」としてUIへ返す。
  const processAchievements = useCallback(
    (event: AchievementEvent): AchievementDef[] => {
      const current = recordsStore.load().records;
      const gained = computeNewAchievements(current.achievements ?? [], event, current);
      if (gained.length === 0) {
        return [];
      }
      if (!tryWrite(() => recordsStore.unlockAchievements(gained))) {
        return [];
      }
      setRecordsVersion((v) => v + 1);
      return ACHIEVEMENTS.filter((achievement) => gained.includes(achievement.id));
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
    decks.find((stored) => stored.deck.id === deckId)?.deck;

  // 保存データの回復・削除・別タブ操作で表示中entityが消えてもblank screenにしない。
  useEffect(() => {
    const needsDeck =
      screen.kind === 'deckDetail' ||
      screen.kind === 'deckEditor' ||
      screen.kind === 'matchSetup' ||
      screen.kind === 'match';
    if (!needsDeck) {
      return;
    }

    const deck = deckOf(screen.deckId);
    if (!deck) {
      appendSaveNotice('表示対象のデッキが見つからないため、安全な画面へ戻りました。');
      setScreen(
        screen.kind === 'deckDetail' || screen.kind === 'deckEditor'
          ? { kind: 'deckList' }
          : { kind: 'top' },
      );
      return;
    }

    if (
      (screen.kind === 'matchSetup' || screen.kind === 'match') &&
      !deck.variants.some((variant) => variant.id === deck.activeVariantId)
    ) {
      appendSaveNotice('有効なルール設定が見つからないため、対局を開始せずTOPへ戻りました。');
      setScreen({ kind: 'top' });
    }
  }, [appendSaveNotice, decks, screen]);

  // MatchSessionはkey={seed}でremountする。同一msの再戦でも衝突させない。
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
    if (!tryWrite(() => deckStore.saveDeck(result.deck, 'imported'))) {
      // modalと入力を保持する。
      return;
    }
    refreshDecks();
    processAchievements({ type: 'deckImported' });
    setImportOpen(false);
    setImportText('');
    setImportIssues([]);
    setScreen({ kind: 'deckDetail', deckId: result.deck.id });
  };

  const handleExport = (deck: DeckProject) => {
    const text = deckStore.exportDeck(deck.id);
    if (text === null) {
      appendSaveNotice('書き出すデッキが見つかりませんでした。');
      return;
    }
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${deck.id}.deck.json`;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    processAchievements({ type: 'deckExported' });
  };

  // 対局終了時の記録。storage層のmatchKey冪等性で二重加算を防ぐ。
  const recordMatch = useCallback(
    (
      finalState: MatchState,
      matchSessionId?: string,
    ): { coinsEarned: number; newlyUnlocked: AchievementDef[] } => {
      const stored = decks.find((entry) => entry.deck.id === finalState.deckProjectId);
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
        // Resultはin-memory stateで表示し、未保存報酬は0として明示する。
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
        const source = decks.find((stored) => stored.deck.id === deck.id)?.source ?? 'created';
        return (
          <DeckEditorScreen
            deck={deck}
            onSave={(updated) => {
              const saveSource = source === 'official' ? 'created' : source;
              if (!tryWrite(() => deckStore.saveDeck(updated, saveSource))) {
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
        const variant = deck?.variants.find((item) => item.id === deck.activeVariantId);
        if (!deck || !variant) {
          return null;
        }
        return (
          <MatchSetupScreen
            deck={deck}
            variant={variant}
            onBack={() => setScreen({ kind: 'top' })}
            onStart={(playerCount) => {
              if (decks.find((stored) => stored.deck.id === deck.id)?.source === 'created') {
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
        const variant = deck?.variants.find((item) => item.id === deck.activeVariantId);
        if (!deck || !variant) {
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
