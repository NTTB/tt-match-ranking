import { TTSet } from "./tt-set";

/**
 * A set intended to be used in a match.
 */
export interface TTMatchSet {
  /**
   * A key given to the set, so that it can later be easily identified.
   */
  id: number;

  /**
   * The key for the home player associated player in the match.
   */
  homePlayerId: number;

  /**
   * The key for the away player associated player in the match.
   */
  awayPlayerId: number;

  /**
   * The score state of the set.
   */
  set: TTSet;
}

/**
 * The match
 *
 * The match is often an tournament or a competition in table tennis. It should **not** be confused with a set or game.
 *
 * This type is intended to be (re-)created whenever data needs to be updated. It should **not** be used as a way of storing match data.
 *
 * @typeParam T - A type to associate the players. Can be a string or an object.
 */
export class TTMatch<T> {
  private readonly players: T[] = [];
  private readonly sets: TTMatchSet[] = [];

  /**
   * Adds a player (or team) to the match. A match can have multiple players (unlike a set that has two).
   * @param player The information about a player
   * @returns A number to be used as `homePlayerId` or `awayPlayerId`
   */
  addPlayer(player: T): number {
    if (this.players.includes(player)) {
      throw new Error("This player was already added");
    }

    return this.players.push(player);
  }

  /**
   * Retrieves all previously added players.
   */
  getPlayers(): { id: number; player: T }[] {
    return this.players.map((v, i) => {
      return {
        id: i + 1,
        player: v,
      };
    });
  }

  /**
   * Retrieves an previously added player.
   * @param id The id of the player when it was added to the match.
   */
  getPlayerById(id: number): T {
    return this.players[id - 1];
  }

  /**
   * Retrieves all the sets that were previously added to the match.
   */
  getSets(): TTMatchSet[] {
    return this.sets;
  }

  /**
   * Adds a played set to the game.
   * @param homePlayerId The id of the home player (must be associated with this match)
   * @param awayPlayerId The id of the away player (must be associated with this match)
   * @param set The state of the set
   * @returns An number to identify the added set.
   */
  addSet(homePlayerId: number, awayPlayerId: number, set: TTSet): number {
    if (homePlayerId == awayPlayerId)
      throw new Error("The homePlayerId and awayPlayerId cannot be the same");
    if (!this.isPlayerIdKnown(homePlayerId))
      throw new Error("The homePlayerId is not part of this match");
    if (!this.isPlayerIdKnown(awayPlayerId))
      throw new Error("The awayPlayerId is not part of this match");
    if (this.isSetKnown(set))
      throw new Error("The set was already added to the match");

    return this.sets.push({
      id: this.sets.length + 1,
      homePlayerId,
      awayPlayerId,
      set,
    });
  }

  /**
   * Retrieves an previously added set.
   * @param id The id of a set when it was added to the match
   */
  getSetById(id: number): TTMatchSet {
    return this.sets[id - 1];
  }

  private isPlayerIdKnown(id: number): boolean {
    return this.getPlayers().some((x) => x.id === id);
  }

  private isSetKnown(set: TTSet): boolean {
    return this.getSets().some((x) => x.set === set);
  }
}
