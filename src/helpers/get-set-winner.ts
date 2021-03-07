import { TTSetRules, assertSetRules } from "../rules";
import { TTSet } from "../tt-set";
import { getGameWinner } from "./get-game-winner";

/**
 * @internal
 * Determines the winner (if any) of a __played__ set (doesn't work with walkover).
 * @param set The set that was played
 * @param rules The rules to determine who has won
 * @returns
 * - `home` when the home player has won
 * - `away` when the away player has won
 * - `undefined` when no winner can be determined.
 */
export function getSetWinner(
  set: TTSet,
  rules: TTSetRules
): "home" | "away" | undefined {
  assertSetRules(rules);
  const reqWins = Math.ceil(rules.bestOf / 2);
  let homeWins = 0;
  let awayWins = 0;
  for (let gameIndex = 0; gameIndex < set.games.length; gameIndex++) {
    const game = set.games[gameIndex];
    const gameWinner = getGameWinner(game, rules.gameRules);
    if (gameWinner == "home") homeWins++;
    if (gameWinner == "away") awayWins++;
    if (gameWinner == undefined) break;
    if (homeWins >= reqWins) return "home";
    if (awayWins >= reqWins) return "away";
  }

  return undefined;
}
