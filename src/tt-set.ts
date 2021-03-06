import { TTGame } from "./tt-game";

export interface TTSet {
  games: TTGame[];
  walkover?: "home" | "away";
}
