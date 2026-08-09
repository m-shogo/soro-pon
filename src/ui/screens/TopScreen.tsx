import { useMemo, useState } from 'react';
import starterRaw from '../../../samples/animal-starter.deck.json';
import type { DeckProject } from '../../domain/deck';
import type { MatchRecord } from '../../schemas/storageSchema';
import {
  buildLocalDataRecoveryBundle,
  serializeLocalDataRecoveryBundle,
} from '../../storage/localDataRecoveryExport';
import { resetAllLocalData } from '../../storage/resetLocalData';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { Modal } from '../components/Modal';
import { SkinSelector } from '../components/SkinSelector';
import { TileCard } from '../components/TileCard';
import { InkDivider } from '../primitives/InkDivider';

const FEATURED_DECK = starterRaw as DeckProject;

function formatDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function recoveryFileName(exportedAtMs: number): string {
  const timestamp = new Date(exportedAtMs).toISOString().replace(/[:.]/g, '-');
  return `soro-pon-recovery-${timestamp}.json`;
}

function downloadRecoveryBundle(text: string, exportedAtMs: number): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = recoveryFileName(exportedAtMs);
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    if (typeof URL.revokeObjectURL === 'function') {
      window.setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ダウンロード後のbest-effort cleanup。UI成功判定を巻き戻さない。
        }
      }, 0);
    }
  }
}

export function TopScreen({
  onPlayNow,
  onDeckList,
  onImport,
  onCollection,
  hasPlayableDeck,
  coins,
  recentRecords,
}: {
  onPlayNow: () => void;
  onDeckList: () => void;
  onImport: () => void;
  onCollection: () => void;
  hasPlayableDeck: boolean;
  coins: number;
  recentRecords: MatchRecord[];
}) {
  const [skinModalOpen, setSkinModalOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [recoveryNotice, setRecoveryNotice] = useState<{
    tone: 'status' | 'error';
    message: string;
  } | null>(null);

  const previewTiles = FEATURED_DECK.tiles.slice(0, 8);
  const categoryById = useMemo(
    () => new Map(FEATURED_DECK.categories.map((category) => [category.id, category])),
    [],
  );
  const totalTiles = FEATURED_DECK.tiles.reduce((sum, tile) => sum + tile.count, 0);
  const activeVariant = FEATURED_DECK.variants.find(
    (variant) => variant.id === FEATURED_DECK.activeVariantId,
  );

  const handleRecoveryExport = () => {
    setRecoveryNotice(null);
    const result = buildLocalDataRecoveryBundle(window.localStorage);
    if (result.recoveredCount === 0) {
      setRecoveryNotice({
        tone: result.failedKeys.length > 0 ? 'error' : 'status',
        message:
          result.failedKeys.length > 0
            ? `退避データを読み取れませんでした（${result.failedKeys.length}件）。ブラウザの保存領域設定を確認してください。`
            : '書き出せる破損データの退避コピーはありません。',
      });
      return;
    }

    try {
      downloadRecoveryBundle(
        serializeLocalDataRecoveryBundle(result.bundle),
        result.bundle.exportedAtMs,
      );
    } catch {
      setRecoveryNotice({
        tone: 'error',
        message:
          '退避データのファイルを作成できませんでした。ブラウザのダウンロード設定を確認してください。データ自体は削除していません。',
      });
      return;
    }

    setRecoveryNotice({
      tone: result.failedKeys.length > 0 ? 'error' : 'status',
      message:
        result.failedKeys.length > 0
          ? `退避コピー${result.recoveredCount}件を書き出しましたが、${result.failedKeys.length}件は読み取れませんでした。初期化前にファイルを保管してください。`
          : `破損データの退避コピー${result.recoveredCount}件を書き出しました。初期化前にファイルを保管してください。`,
    });
  };

  const openResetConfirm = () => {
    setResetError(null);
    setDataModalOpen(false);
    setResetConfirmOpen(true);
  };

  const returnToDataManagement = () => {
    setResetConfirmOpen(false);
    setDataModalOpen(true);
  };

  return (
    <div className="sp-screen sp-top-screen">
      <div className="sp-screen__header sp-top-screen__header">
        <h1 className="sp-screen__title">soro-pon</h1>
        <span className="sp-screen__subtitle">Vamp Pon 世界の中で流行っている記憶札遊び</span>
      </div>

      <div className="sp-top-stage">
        <section className="sp-top-stage__hero" aria-labelledby="sp-top-featured-deck-title">
          <div className="sp-top-stage__hero-head">
            <span className="sp-top-stage__kicker">今夜の記憶札</span>
            <span className="sp-top-stage__status" data-ready={hasPlayableDeck || undefined}>
              {hasPlayableDeck ? '対局可' : '準備が必要'}
            </span>
          </div>

          <div className="sp-top-stage__deck-copy">
            <h2 id="sp-top-featured-deck-title">{FEATURED_DECK.name}</h2>
            <p>{FEATURED_DECK.description || '牌を選び、役を作って競う。'}</p>
          </div>

          <div className="sp-top-stage__rack" aria-hidden="true">
            {previewTiles.map((tile) => {
              const category = categoryById.get(tile.primaryCategoryId);
              return (
                <TileCard
                  key={tile.id}
                  name={tile.name}
                  {...(tile.emoji !== undefined ? { emoji: tile.emoji } : {})}
                  fallbackLabel={tile.fallbackLabel}
                  {...(category
                    ? { categoryColor: category.color, categoryName: category.name }
                    : {})}
                  showName={false}
                  interactive={false}
                />
              );
            })}
          </div>

          <dl className="sp-top-stage__deck-spec" aria-label={`${FEATURED_DECK.name}の構成`}>
            <div>
              <dt>牌</dt>
              <dd>{totalTiles}枚</dd>
            </div>
            <div>
              <dt>種類</dt>
              <dd>{FEATURED_DECK.tiles.length}種</dd>
            </div>
            <div>
              <dt>役</dt>
              <dd>{activeVariant?.winRoles.length ?? 0}組</dd>
            </div>
            <div>
              <dt>カテゴリ</dt>
              <dd>{FEATURED_DECK.categories.length}</dd>
            </div>
          </dl>

          <Button
            variant="primary"
            subLabel={hasPlayableDeck ? 'このデッキで対局設定へ' : '遊べるデッキを作成・読み込みします'}
            onClick={hasPlayableDeck ? onPlayNow : onDeckList}
          >
            {hasPlayableDeck ? 'まず遊ぶ' : 'デッキを準備'}
          </Button>
        </section>

        <nav className="sp-top-stage__nav" aria-label="ホームメニュー">
          <div className="sp-top-stage__nav-main">
            <Button variant="ink" subLabel="保存したデッキを選ぶ・編集" onClick={onDeckList}>
              デッキ一覧
            </Button>
            <Button
              variant="ink"
              subLabel={`あがった役と記録 / 記憶コイン ${coins}`}
              onClick={onCollection}
            >
              記憶帳
            </Button>
          </div>

          <div className="sp-top-stage__utility" aria-label="その他の操作">
            <Button variant="ghost" onClick={onImport}>
              JSONを読み込む
            </Button>
            <Button variant="ghost" onClick={() => setSkinModalOpen(true)}>
              きせかえ
            </Button>
            <Button variant="ghost" onClick={() => setDataModalOpen(true)}>
              データ管理
            </Button>
          </div>

          <p className="sp-top-tagline">記憶の札を集め、役を作って競う。</p>

          {recentRecords.length > 0 && (
            <div className="sp-top-stage__recent">
              <div className="sp-top-stage__recent-head">
                <strong>最近の記録</strong>
                <span>{recentRecords.length}局</span>
              </div>
              <ol>
                {recentRecords.map((record, i) => (
                  <li key={`${record.dateMs}-${i}`}>
                    <time>{formatDate(record.dateMs)}</time>
                    <span>
                      {record.reason === 'draw'
                        ? '流局'
                        : `${record.winnerName} / ${record.selectedWinRoleName ?? ''} / ${
                            record.reason === 'tsumo' ? 'ツモ' : 'ロン'
                          }`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </nav>
      </div>

      <Modal open={skinModalOpen} title="きせかえ" onClose={() => setSkinModalOpen(false)}>
        <SkinSelector />
        <div style={{ marginTop: 'var(--sp-space-12)' }}>
          <Button variant="ghost" onClick={() => setSkinModalOpen(false)}>
            とじる
          </Button>
        </div>
      </Modal>

      <Modal open={dataModalOpen} title="データ管理" onClose={() => setDataModalOpen(false)}>
        <div className="sp-data-management">
          <p className="sp-data-management__lead">
            破損時の退避コピーを書き出すか、この端末のローカルデータを初期化できます。
          </p>
          <Button variant="ink" onClick={handleRecoveryExport}>
            退避データを書き出す
          </Button>
          {recoveryNotice !== null && (
            <p
              role={recoveryNotice.tone === 'error' ? 'alert' : 'status'}
              className={recoveryNotice.tone === 'error' ? 'sp-form-error' : undefined}
            >
              {recoveryNotice.message}
            </p>
          )}
          <InkDivider />
          <Button variant="ghost" onClick={openResetConfirm}>
            ローカルデータを初期化…
          </Button>
          {resetError !== null && (
            <p role="alert" className="sp-form-error">
              {resetError}
            </p>
          )}
          <Button variant="ghost" onClick={() => setDataModalOpen(false)}>
            とじる
          </Button>
        </div>
      </Modal>

      <Dialog
        open={resetConfirmOpen}
        title="ローカルデータの初期化"
        message="デッキ・対局記録・実績・設定・スキン選択・破損データの退避コピーを全て削除して最初の状態に戻します。この操作は取り消せません。必要な場合は、先に「退避データを書き出す」で破損時のコピーを保存してください。"
        confirmLabel="全て削除して初期化する"
        cancelLabel="やめる"
        danger
        onConfirm={() => {
          const result = resetAllLocalData(window.localStorage);
          if (result.failedKeys.length > 0) {
            setResetError(
              `一部のローカルデータを削除できませんでした（${result.failedKeys.length}件）。ブラウザの保存領域設定を確認して、もう一度お試しください。`,
            );
            returnToDataManagement();
            return;
          }
          window.location.reload();
        }}
        onCancel={returnToDataManagement}
      />
    </div>
  );
}
