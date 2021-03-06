import { TTSet } from "../tt-set";
import { parseGameScore } from "./parse-game-score";

export function parseSetScore(text: string): TTSet {
  if (text === "wo:home") {
    return { walkover: "home", games: [] };
  }

  if (text === "wo:away") {
    return { walkover: "away", games: [] };
  }

  const games = text
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length)
    .map(parseGameScore);
  return { games };
}
