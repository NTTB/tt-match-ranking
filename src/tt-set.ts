import { assertSetRules, TTSetRules } from "./rules";
import { TTGame, getGameWinner, parseGameScore } from "./tt-game";

export interface TTSet {
  games: TTGame[];
  walkover?: "home" | "away";
}

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
