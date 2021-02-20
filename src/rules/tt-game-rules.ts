export interface TTGameRules {
  scoreMinimum: number;
  scoreDistance: number;
}

export function assertGameRules(rules: TTGameRules): void {
  if (rules.scoreDistance <= 0) throw new Error("The scoreDistance in game-rules must be larger or equel to 1");
  if (rules.scoreMinimum < rules.scoreDistance) throw new Error("The scoreMinimum in game-rules must be larger or equel to scoreDistance");
}