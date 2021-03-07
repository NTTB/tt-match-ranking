import { TTGame } from "../tt-game";

/**
 * Parses the game score to an object
 *
 * Game scores are written as `11-9` where the first value represents the home score and the second one the away score.
 */
export function parseGameScore(input: string): TTGame {
  const parsed = /^(?<home>\d+)-(?<away>\d+)$/.exec(input);
  if (!parsed || !parsed.groups) {
    throw new Error("Unable to parse game score from: " + input);
  }

  return {
    homeScore: parseInt(parsed.groups["home"]),
    awayScore: parseInt(parsed.groups["away"]),
  };
}
