import { TTSet } from "./tt-set";

export interface TTMatchSet {
  id: number;
  homePlayerId: number;
  awayPlayerId: number;
  set: TTSet;
}

export class TTMatch<T> {
  private readonly players: T[] = [];
  private readonly sets: TTMatchSet[] = [];

  addPlayer(player: T): number {
    if (this.players.includes(player)) {
      throw new Error("This player was already added");
    }

    return this.players.push(player);
  }

  getPlayers(): { id: number; player: T }[] {
    return this.players.map((v, i) => {
      return {
        id: i + 1,
        player: v,
      };
    });
  }

  getPlayerById(id: number): T {
    return this.players[id - 1];
  }

  getSets(): TTMatchSet[] {
    return this.sets;
  }

  addSet(set: TTSet, homePlayerId: number, awayPlayerId: number): number {
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
