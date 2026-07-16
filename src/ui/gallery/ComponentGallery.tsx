import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { ResultBreakdown } from '../../domain/score';
import { InkDivider } from '../primitives/InkDivider';
import { LanternGlow } from '../primitives/LanternGlow';
import { ActionPanel } from '../components/ActionPanel';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { Modal } from '../components/Modal';
import { PaperPanel } from '../components/PaperPanel';
import { PlayerPanel } from '../components/PlayerPanel';
import { RoleCard } from '../components/RoleCard';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { Tabs } from '../components/Tab';
import { TileCard } from '../components/TileCard';
import { SkinSelector } from '../components/SkinSelector';
import { NineSliceProof } from './NineSliceProof';
import './gallery.css';

const SAMPLE_BREAKDOWN: ResultBreakdown = {
  winnerPlayerId: 'p1',
  winMethod: 'tsumo',
  selectedWinRoleId: 'win_mammal_three_groups',
  selectedWinRoleName: 'どうぶつ王国',
  basePoints: 80,
  groups: [],
  wildcardAssignments: [
    { id: 'w1', wildcardTileInstanceId: 'star#1', usedAsCategoryId: 'mammal', source: 'auto' },
  ],
  appliedSpecialBonuses: [
    { bonusId: 'b1', name: 'つよい仲間', points: 25, explanation: '' },
  ],
  appliedScoreBonuses: [
    { bonusId: 's1', name: '同じ牌3枚ボーナス', points: 15, matchedCount: 3, cappedByMaxPoints: true },
  ],
  alternativeWinRoleIds: [],
  totalPoints: 120,
  warnings: [],
};

const tileVars = { '--tile-w': '54px', '--tile-h': '72px' } as CSSProperties;

// 画面実装前の部品確認用ギャラリー(開発用hidden view)。
export function ComponentGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState('deck');

  return (
    <div className="sp-gallery">
      <h1 className="sp-gallery__title">soro-pon Component Gallery</h1>

      <section className="sp-gallery__section">
        <h2>Skin切り替え(全部品を両スキンで確認する)</h2>
        <SkinSelector />
      </section>

      {/* request 006(button.secondary.background / panel.paper.default)、
          request 007(badge.info.background候補B)、
          request 008/009(tile.face.base/tile.back.base/button.primary.background
          候補D/E/D)、request 010/011(table.background/panel.modal.background/
          panel.result.frame 候補A/B/B)はfinal昇格・skin.json登録済み。下の
          Button/PaperPanel/Badge/TileCard variantsとGameTableLayout実画面が
          Cute Pop選択中に実際に適用された状態を示す(専用レビューセクションは撤去)。 */}

      <section className="sp-gallery__section">
        <h2>Nine-slice実証(P0-5 / candidatesレビュー)</h2>
        <NineSliceProof />
      </section>

      <section className="sp-gallery__section">
        <h2>Button variants</h2>
        <div className="sp-gallery__row">
          <Button variant="primary" subLabel="山から1枚引く">
            ツモ
          </Button>
          <Button variant="primary" lantern subLabel="8枚+この牌であがる">
            ロン
          </Button>
          <Button variant="paper">まず遊ぶ</Button>
          <Button variant="ink">デッキ一覧</Button>
          <Button variant="ghost">もどる</Button>
          <Button variant="primary" disabled>
            捨てる
          </Button>
          <Button variant="paper" disabled>
            編集
          </Button>
        </div>
      </section>

      <section className="sp-gallery__section">
        <h2>PaperPanel variants</h2>
        <div className="sp-gallery__row sp-gallery__row--stretch">
          <PaperPanel title="紙パネル">通常の紙。黒インクの文字。</PaperPanel>
          <PaperPanel variant="aged" title="古い紙">
            一覧やサブ情報に使う。
          </PaperPanel>
          <PaperPanel variant="ink" title="黒インクパネル">
            夜側のパネル。
          </PaperPanel>
          <PaperPanel selected title="選択中">
            ランタンに照らされた紙。
          </PaperPanel>
        </div>
      </section>

      <section className="sp-gallery__section">
        <h2>TileCard states</h2>
        <div className="sp-gallery__row" style={tileVars}>
          <TileCard name="ライオン" emoji="🦁" fallbackLabel="ラ" categoryColor="#EF4444" categoryName="哺乳類" />
          <TileCard name="ペンギン" emoji="🐧" fallbackLabel="ペ" categoryColor="#3B82F6" categoryName="鳥" selected />
          <TileCard name="イルカ" emoji="🐬" fallbackLabel="イ" categoryColor="#06B6D4" categoryName="海" dimmed />
          <TileCard name="きら星" emoji="⭐" fallbackLabel="星" categoryColor="#F59E0B" categoryName="オールマイティ" emphasis="tsumo" />
          <TileCard name="ワニ" emoji="🐊" fallbackLabel="ワ" categoryColor="#22C55E" categoryName="は虫類" emphasis="ron" />
          <TileCard name="伏せ" fallbackLabel="?" faceDown />
        </div>
      </section>

      <section className="sp-gallery__section">
        <h2>CategoryChip / InkDivider / LanternGlow</h2>
        <div className="sp-gallery__row">
          <CategoryChip name="哺乳類" color="#EF4444" icon="🐾" />
          <CategoryChip name="海の生き物" color="#06B6D4" icon="🌊" />
          <CategoryChip name="オールマイティ" color="#F59E0B" icon="⭐" />
          <Badge variant="warning">wildcardが多すぎます</Badge>
          <Badge variant="info">このカテゴリは未使用です</Badge>
          <LanternGlow strength="strong">
            <span style={{ fontSize: '20px' }}>記憶確定</span>
          </LanternGlow>
        </div>
        <InkDivider />
      </section>

      <section className="sp-gallery__section">
        <h2>PlayerPanel states</h2>
        <div className="sp-gallery__row">
          <PlayerPanel name="あなた" kind="human" handCount={8} discardCount={3} active />
          <PlayerPanel name="トモリ" kind="cpu" handCount={8} discardCount={3} />
          <PlayerPanel name="ながいなまえのプレイヤー" kind="cpu" handCount={9} discardCount={12} />
        </div>
      </section>

      <section className="sp-gallery__section">
        <h2>ActionPanel</h2>
        <div style={{ width: 180 }}>
          <ActionPanel>
            <Button variant="primary" lantern subLabel="引いた9枚であがる">
              ツモ
            </Button>
            <Button variant="primary" subLabel="選んだ牌を捨てる">
              捨てる
            </Button>
            <Button variant="ink" subLabel="何もしない">
              パス
            </Button>
          </ActionPanel>
        </div>
      </section>

      <section className="sp-gallery__section">
        <h2>RoleCard / ScoreBreakdown</h2>
        <div className="sp-gallery__row sp-gallery__row--stretch">
          <div className="sp-gallery__col">
            <RoleCard
              name="どうぶつ王国"
              basePoints={80}
              explanation="哺乳類の3枚グループを3組そろえる。"
              state="completed"
            />
            <RoleCard
              name="海のパレード"
              basePoints={90}
              explanation="海の生き物の3枚グループを3組そろえる。"
              state="tenpai"
            />
            <RoleCard
              name="サバンナの記憶"
              basePoints={110}
              explanation="ライオン・ゾウ・キリンの組と、哺乳類グループ2組をそろえる。"
              state="near"
            />
          </div>
          <PaperPanel title="得点内訳">
            <ScoreBreakdown breakdown={SAMPLE_BREAKDOWN} />
          </PaperPanel>
        </div>
      </section>

      <section className="sp-gallery__section">
        <h2>Tabs / Modal</h2>
        <Tabs
          items={[
            { id: 'deck', label: 'デッキ' },
            { id: 'roles', label: '役' },
            { id: 'bonus', label: 'ボーナス' },
          ]}
          activeId={tab}
          onSelect={setTab}
        />
        <div className="sp-gallery__row" style={{ marginTop: 12 }}>
          <Button variant="ink" onClick={() => setModalOpen(true)}>
            モーダルを開く
          </Button>
        </div>
        <Modal open={modalOpen} title="対戦を中断しますか?" onClose={() => setModalOpen(false)}>
          <p style={{ marginTop: 0 }}>TOPへ戻ると現在の対戦は失われます。</p>
          <div className="sp-gallery__row">
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              中断する
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              つづける
            </Button>
          </div>
        </Modal>
      </section>
    </div>
  );
}
