import { parseSetScore } from "../../parsers";
import { TTMatchRules, TTSetRules, TTGameRules } from "../../rules";
import { TTMatch } from "../../tt-match";
import { TTMatchRank, generateMatchRank } from "../../tt-match-rank";

describe("Incomplete scenario", () => {
  let match: TTMatch<string>;
  let p1: number;
  let p2: number;

  let matchRules: TTMatchRules;
  let setRules: TTSetRules;
  let gameRules: TTGameRules;
  beforeEach(() => {
    match = new TTMatch<string>();
    p1 = match.addPlayer("A");
    p2 = match.addPlayer("B");

    // The following players are added, but not used.
    match.addPlayer("C");
    match.addPlayer("F");
    match.addPlayer("E");
    match.addPlayer("D");

    gameRules = { scoreDistance: 2, scoreMinimum: 11 };
    setRules = {
      bestOf: 5,
      gameRules: gameRules,
    };
    matchRules = { defeatPoints: 1, victoryPoints: 2 };
  });

  describe("no played matches", () => {
    let ranking: TTMatchRank<string>;
    beforeEach(() => {
      ranking = generateMatchRank(match, matchRules, setRules);
    });

    it("should have all 6 players", () => {
      expect(ranking.ranked).toHaveLength(6);
    });
  });

  describe("Only a single set is complete", () => {
    let ranking: TTMatchRank<string>;
    beforeEach(() => {
      match.addSet(p1, p2, parseSetScore("0-11,0-11,0-11"));
      ranking = generateMatchRank(match, matchRules, setRules);
    });

    it("should have all 6 players", () => {
      expect(ranking.ranked).toHaveLength(6);
    });

    it("should have player B be first", () => {
      expect(ranking.ranked[0].player).toBe("B");
    });
  });

  describe("Only a single incomplete set", () => {
    let ranking: TTMatchRank<string>;
    beforeEach(() => {
      match.addSet(p1, p2, parseSetScore("0-11,0-11,0-9"));
      ranking = generateMatchRank(match, matchRules, setRules);
    });

    it("should have all 6 players", () => {
      expect(ranking.ranked).toHaveLength(6);
    });

    it("should have player A be first since the game wasn't completed", () => {
      expect(ranking.ranked[0].player).toBe("A");
    });

    [0, 1, 2, 3, 4, 5].forEach((i) => {
      it(`ranking.ranked[${i}] should have zero sameRankScoreRatioEvery`, () => {
        const r = ranking.ranked[i];

        expect(r.sameRankScoreRatioEvery.lost).toBe(0);
        expect(r.sameRankScoreRatioEvery.won).toBe(0);
      });

      it(`ranking.ranked[${i}] should have zero sameRankGameRatioEvery`, () => {
        const r = ranking.ranked[i];
        expect(r.sameRankGameRatioEvery.lost).toBe(0);
        expect(r.sameRankGameRatioEvery.won).toBe(0);
      });

      it(`ranking.ranked[${i}] should have zero sameRankScoreRatio`, () => {
        const r = ranking.ranked[i];
        expect(r.sameRankScoreRatio.lost).toBe(0);
        expect(r.sameRankScoreRatio.won).toBe(0);
      });

      it(`ranking.ranked[${i}] should have zero sameRankPoints`, () => {
        const r = ranking.ranked[i];
        expect(r.sameRankPoints).toBe(0);
        expect(r.points).toBe(0);
      });

      it(`ranking.ranked[${i}] should have zero points`, () => {
        const r = ranking.ranked[i];
        expect(r.points).toBe(0);
      });
    });
  });
});
