export interface TTMatchRules {
  /**
   * Points gained by winning.
   */
  victoryPoints: number;

  /**
   * Points gained by losing
   */
  defeatPoints: number;
}

export function assertMatchRules(rules: TTMatchRules): void {
  if (rules.victoryPoints <= rules.defeatPoints)
    throw new Error("The victoryPoints should be higher than the defeatPoints");
  if (rules.defeatPoints < 0)
    throw new Error("The defeatPoints must be zero or positive");
}
