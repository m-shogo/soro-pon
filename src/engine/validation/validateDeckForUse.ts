import type { DeckProject } from '../../domain/deck';
import type { DeckValidationResult } from '../../domain/validation';
import { validateDeckEntityIds } from './validateDeckEntityIds';
import { validateDeckProject } from './validateDeckProject';

function deckForSetBasedAnalysis(deck: DeckProject): DeckProject {
  return {
    ...deck,
    tiles: deck.tiles.map((tile) => ({
      ...tile,
      categories: [...new Set(tile.categories)],
      ...(tile.tags !== undefined ? { tags: [...new Set(tile.tags)] } : {}),
    })),
  };
}

/**
 * UI・保存前・対局開始可否で使う統合validator。
 * 既存のゲーム成立性検査に、deck全体のnested ID/membership整合性を加える。
 *
 * category/tag membershipはエンジンと同じ集合として成立性を計算する。
 * 重複自体はV3013でblockし、枚数だけを水増しした誤った成立判定を返さない。
 */
export function validateDeckForUse(deck: DeckProject): DeckValidationResult {
  const gameplay = validateDeckProject({ deck: deckForSetBasedAnalysis(deck) });
  const integrityIssues = validateDeckEntityIds(deck);
  if (integrityIssues.length === 0) {
    return gameplay;
  }
  return {
    status: 'draft',
    issues: [...integrityIssues, ...gameplay.issues],
  };
}
