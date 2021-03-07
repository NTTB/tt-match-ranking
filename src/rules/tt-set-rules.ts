import { TTGameRules } from "./tt-game-rules";

/**
 * A set is won when a players is the best of certain amount of games.
 */
export interface TTSetRules_BestOf {
  /**
   * The rules for winning a game.
   */
  gameRules: TTGameRules;

  /**
   * The total amount of games that can be played. Often 5 or 7.
   *
   * For example:
   * - if the value is 5 then the player needs to win 3 out of 5 games.
   * - if the value is 7 then the player needs to win 4 out of 7 games.
   */
  bestOf: number;
}

/**
 * The set rules (currently only winning by "best-of" is supported)
 */
export type TTSetRules = TTSetRules_BestOf;

/**
 * @internal
 * Validates the set rules
 */
export function assertSetRules(rules: TTSetRules): void {
  if (!rules.gameRules)
    throw new Error("The gameRules are undefined in the setRules");
  if (rules.bestOf <= 0) {
    throw new Error("bestOf should be larger or equal than 1");
  }
}
