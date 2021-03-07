/**
 * Describes how points are awared after completing a set.
 */
export interface TTMatchRules {
  /**
   * Points gained by winning due to a set victory or walkover.
   */
  victoryPoints: number;

  /**
   * Points gained by losing due to a set defeat, but NOT as losing as a result of a walkover.
   */
  defeatPoints: number;
}

/**
 * @internal
 * Validates the match rules
 */
export function assertMatchRules(rules: TTMatchRules): void {
  if (rules.victoryPoints <= rules.defeatPoints)
    throw new Error("The victoryPoints should be higher than the defeatPoints");
  if (rules.defeatPoints < 0)
    throw new Error("The defeatPoints must be zero or positive");
}
