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

// 対局セッションの一意ID(P2-4)。対局開始時に1回だけ発行する。
// seed衝突・再開・リプレイでも別セッションとして区別できる。
export function newMatchSessionId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `ms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

// 決着済みMatchStateから記録一式を組み立てる純関数。
// 副作用(storage書き込み)はここでは行わない。呼び出し側がaddRecordへ渡す。
// matchKeyはmatchSessionId:reason:winner(sessionId未指定の旧経路では
// deckId:variantId:seed:reason:winner)。同じ結果を指す限り常に同一になるため、
// storage層でこれを使った二重記録防止(冪等化)ができる。
export function buildMatchRecordingResult(input: {
  finalState: MatchState;
  deck: DeckProject;
  deckSource: DeckSource;
  /** 対局開始時に発行したセッションID(P2-4)。省略時はseedベースの旧キー */
  matchSessionId?: string;
  /** テスト・リプレイ用に注入可能な現在時刻 */
  nowMs?: number;
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
    dateMs: input.nowMs ?? Date.now(),
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

  const matchKey =
    input.matchSessionId !== undefined
      ? `${input.matchSessionId}:${result.reason}:${result.winnerPlayerId ?? 'draw'}`
      : `${finalState.deckProjectId}:${finalState.variantId}:${finalState.seed}:${result.reason}:${result.winnerPlayerId ?? 'draw'}`;

  return {
    record,
    matchKey,
    ...(roleKey !== undefined ? { roleKey } : {}),
    achievementEvent,
  };
}
