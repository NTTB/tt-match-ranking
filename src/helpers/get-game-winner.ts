import { assertGameRules, TTGameRules } from "../rules";
import { TTGame } from "../tt-game";

/**
 * @internal
 * Determines the winner (if any) of a game.
 * @param game The game that has played
 * @param rules The rules to determine who has won
 * @returns
 * - `home` when the home player has won
 * - `away` when the away player has won
 * - `undefined` when no winner can be determined.
 */
export function getGameWinner(
  game: TTGame,
  rules: TTGameRules
): "home" | "away" | undefined {
  assertGameRules(rules);
  const scoreDiff = game.homeScore - game.awayScore;

  const hasMinimum =
    Math.max(game.homeScore, game.awayScore) >= rules.scoreMinimum;
  const hasDistance = Math.abs(scoreDiff) >= rules.scoreDistance;

  if (hasMinimum && hasDistance) {
    return scoreDiff > 0 ? "home" : "away";
  }

  return undefined;
}
