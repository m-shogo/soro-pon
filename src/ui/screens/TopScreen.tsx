import { useState } from 'react';
import type { MatchRecord } from '../../schemas/storageSchema';
import {
  buildLocalDataRecoveryBundle,
  serializeLocalDataRecoveryBundle,
} from '../../storage/localDataRecoveryExport';
import { resetAllLocalData } from '../../storage/resetLocalData';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { Modal } from '../components/Modal';
import { PaperPanel } from '../components/PaperPanel';
import { SkinSelector } from '../components/SkinSelector';
import { InkDivider } from '../primitives/InkDivider';

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
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">soro-pon</h1>
        <span className="sp-screen__subtitle">Vamp Pon 世界の中で流行っている記憶札遊び</span>
      </div>
      <div className="sp-screen__body" style={{ alignItems: 'stretch' }}>
        <div className="sp-top-menu sp-screen__col--scroll">
          <Button
            variant="primary"
            subLabel={hasPlayableDeck ? 'すぐに対戦をはじめます' : '遊べるデッキを作成・読み込みします'}
            onClick={hasPlayableDeck ? onPlayNow : onDeckList}
          >
            {hasPlayableDeck ? 'まず遊ぶ' : 'デッキを準備'}
          </Button>
          <Button variant="paper" subLabel="保存したデッキを確認・編集します" onClick={onDeckList}>
            デッキ一覧
          </Button>
          <Button variant="paper" subLabel="デッキデータ(JSON)を読み込みます" onClick={onImport}>
            JSONを読み込む
          </Button>
          <Button
            variant="paper"
            subLabel={`あがった役と記録。記憶コイン ${coins}`}
            onClick={onCollection}
          >
            記憶帳
          </Button>
          <InkDivider />
          <div className="sp-top-menu__secondary">
            <Button
              variant="ink"
              subLabel="見た目を切り替えます"
              onClick={() => setSkinModalOpen(true)}
            >
              きせかえ
            </Button>
            <Button
              variant="ghost"
              subLabel="退避・初期化"
              onClick={() => setDataModalOpen(true)}
            >
              データ管理
            </Button>
          </div>
          <p className="sp-top-tagline">
            記憶の札を集め、役を作って競う。
          </p>
        </div>
        <div className="sp-screen__spacer" />
        {recentRecords.length > 0 && (
          <div className="sp-screen__col sp-screen__col--side">
            <PaperPanel variant="ink" title="最近の記録">
              <ul className="sp-issue-list">
                {recentRecords.map((record, i) => (
                  <li key={`${record.dateMs}-${i}`}>
                    {formatDate(record.dateMs)}
                    <br />
                    {record.reason === 'draw'
                      ? '流局'
                      : `${record.winnerName}が「${record.selectedWinRoleName ?? ''}」で${
                          record.reason === 'tsumo' ? 'ツモ' : 'ロン'
                        }`}
                  </li>
                ))}
              </ul>
            </PaperPanel>
          </div>
        )}
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
