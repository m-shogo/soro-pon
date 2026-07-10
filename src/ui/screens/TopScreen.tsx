import { useState } from 'react';
import type { MatchRecord } from '../../schemas/storageSchema';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { PaperPanel } from '../components/PaperPanel';
import { SkinSelector } from '../components/SkinSelector';
import { InkDivider } from '../primitives/InkDivider';

function formatDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  return (
    <div className="sp-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">soro-pon</h1>
        <span className="sp-screen__subtitle">Vamp Pon 世界の中で流行っている記憶札遊び</span>
      </div>
      <div className="sp-screen__body" style={{ alignItems: 'stretch' }}>
        <div className="sp-top-menu sp-screen__col--scroll">
          <Button
            variant="paper"
            subLabel="すぐに対戦をはじめます"
            onClick={onPlayNow}
            disabled={!hasPlayableDeck}
          >
            まず遊ぶ
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
          <Button
            variant="ink"
            subLabel="見た目のスキンを切り替えます"
            onClick={() => setSkinModalOpen(true)}
          >
            きせかえ
          </Button>
          <InkDivider />
          <p className="sp-top-tagline">
            記憶の札を集め、役を作って競う遊びです。
            <br />
            夜の帳が下りた、記憶の欠片を集める頃。
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
    </div>
  );
}
