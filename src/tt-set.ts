import { TTGame } from "./tt-game";

/**
 * The state of a set (a collection of games).
 *
 * In dutch often confused for a game or a match.
 */
export interface TTSet {
  /**
   * The games that have played or are being played.
   * Is empty array in the event of a walkover.
   */
  games: TTGame[];

  /**
   * Optional property that says which side has won because the other party didn't play the set.
   */
  walkover?: "home" | "away";
}
