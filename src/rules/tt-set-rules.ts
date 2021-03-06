import { TTGameRules } from "./tt-game-rules";

interface TTSetRules_BestOf {
  gameRules: TTGameRules;
  bestOf: number;
}

export type TTSetRules = TTSetRules_BestOf;

export function assertSetRules(rules: TTSetRules): void {
  if (!rules.gameRules)
    throw new Error("The gameRules are undefined in the setRules");
  if (rules.bestOf <= 0) {
    throw new Error("bestOf should be larger or equal than 1");
  }
}
