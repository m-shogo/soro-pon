import type { DeckProject } from '../../domain/deck';
import type { DeckValidationResult } from '../../domain/validation';
import { validateDeckEntityIds } from './validateDeckEntityIds';
import { validateDeckProject } from './validateDeckProject';

/**
 * UI・保存前・対局開始可否で使う統合validator。
 * 既存のゲーム成立性検査に、deck全体のnested ID一意性を加える。
 */
export function validateDeckForUse(deck: DeckProject): DeckValidationResult {
  const gameplay = validateDeckProject({ deck });
  const entityIdIssues = validateDeckEntityIds(deck);
  if (entityIdIssues.length === 0) {
    return gameplay;
  }
  return {
    status: 'draft',
    issues: [...entityIdIssues, ...gameplay.issues],
  };
}
