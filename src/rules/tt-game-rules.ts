/**
 * The rules that describe when a game is won.
 */
export interface TTGameRules {
  /**
   * The minimum score that either player must reach. Almost always 11.
   */
  scoreMinimum: number;

  /**
   * The minimum distance in score players must have. Almost always 2.
   */
  scoreDistance: number;
}

/**
 * @internal
 * Validates the game rules.
 */
export function assertGameRules(rules: TTGameRules): void {
  if (rules.scoreDistance <= 0)
    throw new Error(
      "The scoreDistance in game-rules must be larger or equel to 1"
    );
  if (rules.scoreMinimum < rules.scoreDistance)
    throw new Error(
      "The scoreMinimum in game-rules must be larger or equel to scoreDistance"
    );
}
