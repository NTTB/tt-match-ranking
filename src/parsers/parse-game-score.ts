import { TTGame } from "../tt-game";

export function parseGameScore(text: string): TTGame {
  const parsed = /^(?<home>\d+)-(?<away>\d+)$/.exec(text);
  if (!parsed || !parsed.groups) {
    throw new Error("Unable to parse game score from: " + text);
  }

  return {
    homeScore: parseInt(parsed.groups["home"]),
    awayScore: parseInt(parsed.groups["away"]),
  };
}
