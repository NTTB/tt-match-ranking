import { assertGameRules, TTGameRules } from "../rules";
import { TTGame } from "../tt-game";

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
