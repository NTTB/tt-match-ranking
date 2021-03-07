import { TTSet } from "../tt-set";
import { parseGameScore } from "./parse-game-score";

/**
 * Parses the set score to an object.
 * The input is a string of game-scores (`11-9`) where each game score is seperated by a comma (`,`).
 * Set score can also be `wo:home` or `wo:away` which stands for a walkover. A walkover occurs when a when **no games** are played due to a player/side not starting the set.
 *
 * Examples:
 * - `11-9,10-12` - Two sets were played, 11-9 and 10-12
 * - `wo:home` - The home player has won by default
 * - `wo:away` - The away player has won by default
 */
export function parseSetScore(input: string): TTSet {
  if (input === "wo:home") {
    return { walkover: "home", games: [] };
  }

  if (input === "wo:away") {
    return { walkover: "away", games: [] };
  }

  const games = input
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length)
    .map(parseGameScore);
  return { games };
}
