import type { ResultBreakdown } from '../domain/score';
import type { RecordsPayload } from '../schemas/storageSchema';

// クリアボード(docs/29): 5x5=25マスの実績。純関数のみ。
// コイン・実績は見た目と記録のためのもので、対局の強さには影響しない。

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-win', title: 'はじめての記憶', description: '初めて勝利する' },
  { id: 'win-ron', title: '差し込む灯り', description: 'ロンで勝つ' },
  { id: 'win-tsumo', title: '引き寄せた欠片', description: 'ツモで勝つ' },
  { id: 'draw-round', title: '静かな夜', description: '流局を経験する' },
  { id: 'win-with-wildcard', title: 'きら星の導き', description: 'オールマイティを使って勝つ' },
  { id: 'win-without-wildcard', title: '素の記憶', description: 'オールマイティなしで勝つ' },
  { id: 'score-bonus-fired', title: '重なる欠片', description: 'スコアボーナスを発動して勝つ' },
  { id: 'special-bonus-fired', title: '特別な一葉', description: '特別ボーナスを発動して勝つ' },
  { id: 'double-special-bonus', title: '二重の祝福', description: '特別ボーナスを2つ以上同時に発動' },
  { id: 'score-100', title: '百の記憶', description: '100点以上で勝つ' },
  { id: 'score-200', title: '二百の記憶', description: '200点以上で勝つ' },
  { id: 'win-specific-collection', title: '揃いの一組', description: '特定の組み合わせ役で勝つ' },
  { id: 'win-3players', title: '三人の夜', description: '3人戦で勝つ' },
  { id: 'win-4players', title: '四人の夜', description: '4人戦で勝つ' },
  { id: 'play-5', title: '常連の席', description: '5局遊ぶ' },
  { id: 'play-20', title: '夜更かしの札師', description: '20局遊ぶ' },
  { id: 'three-roles', title: '役の目利き', description: '3種類の役であがる' },
  { id: 'coins-500', title: '小さな貯め込み', description: '記憶コインを500ためる' },
  { id: 'coins-2000', title: '記憶の富豪', description: '記憶コインを2000ためる' },
  { id: 'save-created-deck', title: 'デッキビルダー', description: '自作デッキを保存する' },
  { id: 'export-deck', title: '旅立つ記憶', description: 'デッキをエクスポートする' },
  { id: 'import-deck', title: '届いた記憶', description: 'デッキをインポートする' },
  { id: 'play-created-deck', title: '自分の卓', description: '自作デッキで対局する' },
  { id: 'save-clean-deck', title: '職人の仕上げ', description: '警告0のデッキを保存する' },
  { id: 'win-created-deck', title: '自作の誇り', description: '自作デッキで勝つ' },
];

export type AchievementEvent =
  | {
      type: 'matchEnd';
      reason: 'tsumo' | 'ron' | 'draw';
      humanWon: boolean;
      playerCount: number;
      deckSource: 'official' | 'created' | 'imported';
      breakdown?: ResultBreakdown;
      selectedRoleFamily?: string;
    }
  | { type: 'deckSaved'; source: 'official' | 'created' | 'imported'; hasWarnings: boolean }
  | { type: 'deckExported' }
  | { type: 'deckImported' }
  | { type: 'matchStartedWithCreatedDeck' };

// eventと累計状態から新しく解放される実績IDを返す。
export function computeNewAchievements(
  unlocked: string[],
  event: AchievementEvent,
  records: RecordsPayload,
): string[] {
  const has = new Set(unlocked);
  const gained: string[] = [];
  const gain = (id: string) => {
    if (!has.has(id)) {
      has.add(id);
      gained.push(id);
    }
  };

  // 累計系(どのeventでも再評価してよい)
  const totalMatches = records.totalMatches ?? records.records.length;
  if (totalMatches >= 5) {
    gain('play-5');
  }
  if (totalMatches >= 20) {
    gain('play-20');
  }
  if (records.coins >= 500) {
    gain('coins-500');
  }
  if (records.coins >= 2000) {
    gain('coins-2000');
  }
  if (records.roleCollection.length >= 3) {
    gain('three-roles');
  }

  switch (event.type) {
    case 'matchEnd': {
      if (event.reason === 'draw') {
        gain('draw-round');
      }
      if (event.humanWon) {
        gain('first-win');
        if (event.reason === 'ron') {
          gain('win-ron');
        }
        if (event.reason === 'tsumo') {
          gain('win-tsumo');
        }
        if (event.playerCount === 3) {
          gain('win-3players');
        }
        if (event.playerCount === 4) {
          gain('win-4players');
        }
        if (event.deckSource === 'created') {
          gain('win-created-deck');
        }
        const breakdown = event.breakdown;
        if (breakdown) {
          if (breakdown.wildcardAssignments.length > 0) {
            gain('win-with-wildcard');
          } else {
            gain('win-without-wildcard');
          }
          if (breakdown.appliedScoreBonuses.length > 0) {
            gain('score-bonus-fired');
          }
          if (breakdown.appliedSpecialBonuses.length > 0) {
            gain('special-bonus-fired');
          }
          if (breakdown.appliedSpecialBonuses.length >= 2) {
            gain('double-special-bonus');
          }
          if (breakdown.totalPoints >= 100) {
            gain('score-100');
          }
          if (breakdown.totalPoints >= 200) {
            gain('score-200');
          }
          if (event.selectedRoleFamily === 'specificCollection') {
            gain('win-specific-collection');
          }
        }
      }
      return gained;
    }
    case 'deckSaved': {
      if (event.source === 'created') {
        gain('save-created-deck');
      }
      if (!event.hasWarnings) {
        gain('save-clean-deck');
      }
      return gained;
    }
    case 'deckExported':
      gain('export-deck');
      return gained;
    case 'deckImported':
      gain('import-deck');
      return gained;
    case 'matchStartedWithCreatedDeck':
      gain('play-created-deck');
      return gained;
  }
}

// 称号(docs/29): 実績数で進む。表示専用。
export function titleFor(achievementCount: number): string {
  if (achievementCount >= 22) {
    return '記憶の書き手';
  }
  if (achievementCount >= 15) {
    return '役職人';
  }
  if (achievementCount >= 8) {
    return '記憶集めの常連';
  }
  if (achievementCount >= 3) {
    return 'はじめての役職人';
  }
  return '見習いの札師';
}
