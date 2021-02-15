import { TTGame, TTGameRules, getGameWinner, parseGameScore } from "./tt-game";

export interface TTSet {
  games: TTGame[];
}

export function parseSetScore(text: string): TTGame[] {
  return text.split(",")
    .map(x => x.trim())
    .filter(x => x.length)
    .map(parseGameScore);
}

interface TTSetRules_BestOf {
  gameRules: TTGameRules;
  bestOf: number;
}

export type TTSetRules = TTSetRules_BestOf;

export function getSetWinner(set: TTSet, rules: TTSetRules): "home" | "away" {
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

export function assertSetRules(rules: TTSetRules) {
  if (!rules.gameRules) throw new Error("The gameRules are undefined in the setRules");
}