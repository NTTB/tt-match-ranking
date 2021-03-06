import { TTGameRules, TTMatchRules, TTSetRules } from "../rules";
import { TTMatch } from "../tt-match";
import { generateMatchRank, TTMatchRank } from "../tt-match-rank";
import { parseSetScore } from "../tt-set";

describe("Walkover scenarios", () => {
  let match: TTMatch<string>;
  let p1: number;
  let p2: number;
  let p3: number;
  let p4: number;
  let p5: number;
  let p6: number;

  let matchRules: TTMatchRules;
  let setRules: TTSetRules;
  let gameRules: TTGameRules;
  beforeEach(() => {
    match = new TTMatch<string>();
    p1 = match.addPlayer("A");
    p2 = match.addPlayer("B");
    p3 = match.addPlayer("C");
    p4 = match.addPlayer("F");
    p5 = match.addPlayer("E");
    p6 = match.addPlayer("D");

    gameRules = { scoreDistance: 2, scoreMinimum: 11 };
    setRules = {
      bestOf: 3,
      gameRules: gameRules,
    };
    matchRules = { defeatPoints: 1, victoryPoints: 2 };
  });

  describe("One player has walked away from most games", () => {
    let ranking: TTMatchRank<string>;
    beforeEach(() => {
      match.addSet(p1, p2, parseSetScore("wo:home"));
      match.addSet(p1, p3, parseSetScore("wo:home"));
      match.addSet(p1, p4, parseSetScore("0-11, 0-11"));
      match.addSet(p1, p5, parseSetScore("11-0,11-0"));
      match.addSet(p1, p6, parseSetScore("0-11,0-11"));

      match.addSet(p2, p3, parseSetScore("0-11,0-11"));
      match.addSet(p2, p4, parseSetScore("0-11, 0-11"));
      match.addSet(p2, p5, parseSetScore("11-0,11-0"));
      match.addSet(p2, p6, parseSetScore("0-11,0-11"));

      match.addSet(p3, p4, parseSetScore("0-11, 0-11"));
      match.addSet(p3, p5, parseSetScore("11-0,11-0"));
      match.addSet(p3, p6, parseSetScore("0-11,0-11"));

      match.addSet(p4, p5, parseSetScore("11-0,11-0"));
      match.addSet(p4, p6, parseSetScore("0-11,0-11"));

      match.addSet(p5, p6, parseSetScore("11-0,11-0"));
      ranking = generateMatchRank(match, matchRules, setRules);
    });

    it("should have all 6 players", () => {
      expect(ranking.ranked).toHaveLength(6);
    });
  });

  describe("One player has always walked away", () => {
    let ranking: TTMatchRank<string>;
    beforeEach(() => {
      match.addSet(p1, p2, parseSetScore("wo:away"));
      match.addSet(p1, p3, parseSetScore("wo:away"));
      match.addSet(p1, p4, parseSetScore("wo:away"));
      match.addSet(p1, p5, parseSetScore("wo:away"));
      match.addSet(p1, p6, parseSetScore("wo:away"));

      match.addSet(p2, p3, parseSetScore("0-11,0-11"));
      match.addSet(p2, p4, parseSetScore("0-11, 0-11"));
      match.addSet(p2, p5, parseSetScore("11-0,11-0"));
      match.addSet(p2, p6, parseSetScore("0-11,0-11"));

      match.addSet(p3, p4, parseSetScore("0-11, 0-11"));
      match.addSet(p3, p5, parseSetScore("11-0,11-0"));
      match.addSet(p3, p6, parseSetScore("0-11,0-11"));

      match.addSet(p4, p5, parseSetScore("11-0,11-0"));
      match.addSet(p4, p6, parseSetScore("0-11,0-11"));

      match.addSet(p5, p6, parseSetScore("11-0,11-0"));

      ranking = generateMatchRank(match, matchRules, setRules);
    });

    it("should have 5 players", () => {
      expect(ranking.ranked.map((x) => x.player)).toHaveLength(5);
    });

    it("should NOT list player A", () => {
      expect(ranking.ranked.map((x) => x.player)).not.toContain("A");
    });
  });
});
