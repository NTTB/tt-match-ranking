export interface TTMatchRules {
  /**
   * Points gained by winning.
   */
  pointsPerWin: number;

  /**
   * Points gained by losing
   */
  pointsPerLose: number;
}

export function assertMatchRules(rules: TTMatchRules) {
  if (rules.pointsPerWin <= rules.pointsPerLose) throw new Error("The pointsPerWin should be higher than the pointsPerLose");
  if (rules.pointsPerLose < 0) throw new Error("The pointsPerLose must be zero or positive");
}