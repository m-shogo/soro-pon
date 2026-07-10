import type { DeckProject, DeckSource } from '../domain/deck';
import type { MatchState } from '../domain/match';
import { buildMatchRecord } from '../storage/localStorageRecordsStore';
import type { MatchRecord } from '../schemas/storageSchema';
import type { AchievementEvent } from './achievements';

export type MatchRecordingResult = {
  record: MatchRecord;
  /** addRecordへ渡す冪等キー。同じ対局結果からは常に同じ値になる。 */
  matchKey: string;
  roleKey?: string;
  achievementEvent: AchievementEvent;
};

// 決着済みMatchStateから記録一式を組み立てる純関数。
// 副作用(storage書き込み)はここでは行わない。呼び出し側がaddRecordへ渡す。
// matchKeyはdeckId:variantId:seed:reason:winnerで、同じ結果を指す限り常に同一になる
// ため、storage層でこれを使った二重記録防止(冪等化)ができる。
export function buildMatchRecordingResult(input: {
  finalState: MatchState;
  deck: DeckProject;
  deckSource: DeckSource;
}): MatchRecordingResult | null {
  const { finalState, deck, deckSource } = input;
  const result = finalState.result;
  if (!result) {
    return null;
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
    humanWon && breakdown !== undefined ? `${deck.id}:${breakdown.selectedWinRoleId}` : undefined;

  const selectedRoleFamily =
    breakdown !== undefined
      ? deck.variants.flatMap((v) => v.winRoles).find((r) => r.id === breakdown.selectedWinRoleId)
          ?.family
      : undefined;

  const achievementEvent: AchievementEvent = {
    type: 'matchEnd',
    reason: result.reason,
    humanWon,
    playerCount: finalState.players.length,
    deckSource,
    ...(breakdown !== undefined ? { breakdown } : {}),
    ...(selectedRoleFamily !== undefined ? { selectedRoleFamily } : {}),
  };

  const matchKey = `${finalState.deckProjectId}:${finalState.variantId}:${finalState.seed}:${result.reason}:${result.winnerPlayerId ?? 'draw'}`;

  return {
    record,
    matchKey,
    ...(roleKey !== undefined ? { roleKey } : {}),
    achievementEvent,
  };
}
