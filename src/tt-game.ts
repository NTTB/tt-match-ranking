import { assertGameRules, TTGameRules } from "./rules";

export interface TTGame {
  homeScore: number;
  awayScore: number;
}

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

export function getGameAdvantage(game: TTGame): "home" | "away" | undefined {
  if (game.homeScore > game.awayScore) return "home";
  if (game.awayScore > game.homeScore) return "away";
  return undefined;
}

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
