import { TTMatch } from "./tt-match";
import { TTSet } from "./tt-set";

const p1 = "Player 1";
const p2 = "Player 2";
const p3 = "Player 3";
const p4 = "Player 4";
const p5 = "Player 5";

describe("Match and players", () => {
  let match: TTMatch<string>;
  beforeEach(() => {
    match = new TTMatch<string>();
  });

  test("A newly created match has no players", () => {
    expect(match.getPlayers().length).toBe(0);
  });

  test("Adding a player should increase the listed players", () => {
    match.addPlayer(p1);
    expect(match.getPlayers().length).toBe(1);
    expect(match.getPlayers()[0].id).toBe(1);
    expect(match.getPlayers()[0].player).toBe(p1);
  });

  test("Adding a player should increase the listed players", () => {
    match.addPlayer(p1);
    expect(match.getPlayers().length).toBe(1);
    expect(match.getPlayers()[0].id).toBe(1);
    expect(match.getPlayers()[0].player).toBe(p1);
  });

  test("Adding the same player twice should throw an error", () => {
    match.addPlayer(p1);
    expect(() => match.addPlayer(p1)).toThrowError(
      /This player was already added/
    );
  });

  test("Adding a player should return the an id that increases everytime", () => {
    const pId1 = match.addPlayer(p1);
    const pId2 = match.addPlayer(p2);
    const pId3 = match.addPlayer(p3);
    const pId4 = match.addPlayer(p4);
    const pId5 = match.addPlayer(p5);

    expect(pId1).toBe(1);
    expect(pId2).toBe(2);
    expect(pId3).toBe(3);
    expect(pId4).toBe(4);
    expect(pId5).toBe(5);
  });

  describe("getPlayerById(...)", () => {
    beforeEach(() => {
      match.addPlayer(p1);
      match.addPlayer(p2);
      match.addPlayer(p3);
      match.addPlayer(p4);
      match.addPlayer(p5);
    });

    test.each`
      id   | player
      ${1} | ${p1}
      ${2} | ${p2}
      ${3} | ${p3}
      ${4} | ${p4}
      ${5} | ${p5}
    `("should return $player by $id", ({ id, player }) => {
      const result = match.getPlayerById(id);
      expect(result).toBe(player);
    });
  });
});

describe("Match and sets", () => {
  let match: TTMatch<string>;
  beforeEach(() => {
    match = new TTMatch<string>();
  });

  test("A newly created match should have no sets", () => {
    expect(match.getSets().length).toBe(0);
  });

  test("Should throw when adding a set with the same playerId", () => {
    const act = () => match.addSet(0, 0, { games: [] });
    expect(act).toThrowError(
      /The homePlayerId and awayPlayerId cannot be the same/
    );
  });

  test("Should throw when adding a set with homePlayerId not registered", () => {
    match.addPlayer(p1);
    const act = () => match.addSet(2, 1, { games: [] });
    expect(act).toThrowError(/The homePlayerId is not part of this match/);
  });

  test("Should throw when adding a set with awayPlayerId not registered", () => {
    match.addPlayer(p1);
    const act = () => match.addSet(1, 2, { games: [] });
    expect(act).toThrowError(/The awayPlayerId is not part of this match/);
  });

  test("Should throw when adding a set that is already in use", () => {
    match.addPlayer(p1);
    match.addPlayer(p2);
    match.addPlayer(p3);
    match.addPlayer(p4);
    const set: TTSet = { games: [] };
    match.addSet(1, 2, set); // This one is allowed

    const act = () => match.addSet(3, 4, set);
    expect(act).toThrowError(/The set was already added to the match/);
  });

  test("Adding a set should increase the listed set", () => {
    match.addPlayer(p1);
    match.addPlayer(p2);
    match.addSet(1, 2, { games: [] });
    expect(match.getSets().length).toBe(1);
  });

  test("Adding a set should return an id that increase everytime", () => {
    match.addPlayer(p1);
    match.addPlayer(p2);
    match.addPlayer(p3);
    match.addPlayer(p4);
    match.addPlayer(p5);
    const sId1 = match.addSet(1, 2, { games: [] });
    const sId2 = match.addSet(1, 3, { games: [] });
    const sId3 = match.addSet(1, 4, { games: [] });
    const sId4 = match.addSet(1, 5, { games: [] });
    const sId5 = match.addSet(2, 1, { games: [] });

    expect(sId1).toBe(1);
    expect(sId2).toBe(2);
    expect(sId3).toBe(3);
    expect(sId4).toBe(4);
    expect(sId5).toBe(5);
  });

  describe("getSetById(...)", () => {
    const s1: TTSet = { games: [] };
    const s2: TTSet = { games: [] };
    const s3: TTSet = { games: [] };
    const s4: TTSet = { games: [] };
    const s5: TTSet = { games: [] };
    beforeEach(() => {
      match.addPlayer(p1);
      match.addPlayer(p2);
      match.addPlayer(p3);
      match.addPlayer(p4);
      match.addPlayer(p5);

      match.addSet(1, 2, s1);
      match.addSet(1, 3, s2);
      match.addSet(1, 4, s3);
      match.addSet(1, 5, s4);
      match.addSet(2, 1, s5);
    });

    test.each`
      id   | set   | homePlayerId | awayPlayerId
      ${1} | ${s1} | ${1}         | ${2}
      ${2} | ${s2} | ${1}         | ${3}
      ${3} | ${s3} | ${1}         | ${4}
      ${4} | ${s4} | ${1}         | ${5}
      ${5} | ${s5} | ${2}         | ${1}
    `(
      "should return $set with as versus between p$homePlayerId a p$awayPlayerId",
      ({ id, set, homePlayerId, awayPlayerId }) => {
        const result = match.getSetById(id);
        expect(result.set).toBe(set);
        expect(result.homePlayerId).toBe(homePlayerId);
        expect(result.awayPlayerId).toBe(awayPlayerId);
      }
    );
  });
});
