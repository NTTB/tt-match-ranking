import { parseSetScore } from "../parsers";
import { TTMatch } from "../tt-match";
import { generateMatchRank } from "../tt-match-rank";

// A player is removed from the ranking when all of the following conditions are true:
// 1. The player has given up at least once (causing the other to win with a walkover)
// 2. Half or more of the sets of the player were a walkover for the player or the opponent
describe("generateMatchRank(...) - Walkovers", () => {
  let match: TTMatch<string>;
  beforeEach(() => {
    match = new TTMatch<string>();
  });

  // Scenario 1: None of the players gave up
  // Scenario 2: Everbody except player A gave up
  // Scenario 3: Nobody wants to player against A (and is ranked first)
  // Scenario 4: two (out of 3) of the opponents of A gave up, but player A is removed since the last he/she gave up the last game
  // Scenario 5: Player A gave up all games and B only once, both A and B are removed
  describe.each`
    a_vs_b       | a_vs_c       | a_vs_d       | b_vs_c       | b_vs_d       | c_vs_d       | ranked    | unranked | rankedSets
    ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"ABCD"} | ${""}    | ${[1, 2, 3, 4, 5, 6]}
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"A"}    | ${"BCD"} | ${[]}
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"ABCD"} | ${""}    | ${[1, 2, 3, 4, 5, 6]}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"BCD"}  | ${"A"}   | ${[4, 5, 6]}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${"0-11"}    | ${"0-11"}    | ${"CD"}   | ${"AB"}  | ${[6]}
  `(
    "Given sets are [$a_vs_b, $a_vs_c, $a_vs_d, $b_vs_c, $b_vs_d, $c_vs_d]",
    ({
      a_vs_b,
      a_vs_c,
      a_vs_d,
      b_vs_c,
      b_vs_d,
      c_vs_d,
      ranked,
      unranked,
      rankedSets,
    }: {
      a_vs_b: string;
      a_vs_c: string;
      a_vs_d: string;
      b_vs_c: string;
      b_vs_d: string;
      c_vs_d: string;
      ranked: string;
      unranked: string;
      rankedSets: number[];
    }) => {
      match = new TTMatch<string>();
      const p1 = match.addPlayer("A");
      const p2 = match.addPlayer("B");
      const p3 = match.addPlayer("C");
      const p4 = match.addPlayer("D");
      const setsLookup: number[] = [];
      setsLookup.push(match.addSet(p1, p2, parseSetScore(a_vs_b)));
      setsLookup.push(match.addSet(p1, p3, parseSetScore(a_vs_c)));
      setsLookup.push(match.addSet(p1, p4, parseSetScore(a_vs_d)));
      setsLookup.push(match.addSet(p2, p3, parseSetScore(b_vs_c)));
      setsLookup.push(match.addSet(p2, p4, parseSetScore(b_vs_d)));
      setsLookup.push(match.addSet(p3, p4, parseSetScore(c_vs_d)));

      const result = generateMatchRank(
        match,
        { victoryPoints: 2, defeatPoints: 1 },
        { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
      );

      for (let i = 0; i < ranked.length; ++i) {
        const player = ranked[i];
        test(`player ${player} should be ranked`, () => {
          expect(result.ranked.map((x) => x.player)).toContain(player);
        });
      }

      for (let i = 0; i < unranked.length; ++i) {
        const player = unranked[i];
        test(`player ${player} should NOT be ranked`, () => {
          expect(result.ranked.map((x) => x.player)).not.toContain(player);
        });
      }

      test(`total ranked players should be ${ranked.length}`, () => {
        expect(result.ranked).toHaveLength(ranked.length);
      });

      it(`should consider sets [${rankedSets.join(
        ","
      )}] to be the only ranked`, () => {
        expect(result.rankedSets.map((x) => x.id)).toEqual(
          expect.arrayContaining(rankedSets)
        );
      });
    }
  );

  // The unranking of a player also applies when the player has multiple sets
  // against the same opponent.
  describe.each`
    set1         | set2         | set3         | ranked              | unranked            | hasRankedSets
    ${""}        | ${""}        | ${""}        | ${["home", "away"]} | ${[]}               | ${true}
    ${"0-0"}     | ${"0-0"}     | ${"0-0"}     | ${["home", "away"]} | ${[]}               | ${true}
    ${""}        | ${"0-0"}     | ${""}        | ${["home", "away"]} | ${[]}               | ${true}
    ${""}        | ${""}        | ${"wo:home"} | ${["home", "away"]} | ${[]}               | ${true}
    ${""}        | ${""}        | ${"wo:away"} | ${["home", "away"]} | ${[]}               | ${true}
    ${""}        | ${"wo:home"} | ${"wo:home"} | ${["home"]}         | ${["away"]}         | ${false}
    ${""}        | ${"wo:away"} | ${"wo:away"} | ${["away"]}         | ${["home"]}         | ${false}
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${["home"]}         | ${["away"]}         | ${false}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${["away"]}         | ${["home"]}         | ${false}
    ${"wo:home"} | ${"wo:home"} | ${"wo:away"} | ${[]}               | ${["home", "away"]} | ${false}
    ${"wo:home"} | ${"wo:away"} | ${"wo:away"} | ${[]}               | ${["home", "away"]} | ${false}
    ${"wo:home"} | ${""}        | ${"wo:away"} | ${[]}               | ${["home", "away"]} | ${false}
  `(
    "When two players have 3 sets of [$set1, $set2, $set3]",
    ({ set1, set2, set3, ranked, unranked, hasRankedSets }) => {
      beforeEach(() => {
        const p1 = match.addPlayer("home");
        const p2 = match.addPlayer("away");
        match.addSet(p1, p2, parseSetScore(set1));
        match.addSet(p1, p2, parseSetScore(set2));
        match.addSet(p1, p2, parseSetScore(set3));
      });

      test(`${ranked.join(",") || "none"} should be ranked`, () => {
        const result = generateMatchRank(
          match,
          { victoryPoints: 2, defeatPoints: 1 },
          { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
        );
        ranked.forEach((element: "home" | "away") => {
          expect(result.ranked.map((x) => x.player)).toContain(element);
        });
      });

      test(`${unranked.join(",") || "none"} must NOT be ranked`, () => {
        const result = generateMatchRank(
          match,
          { victoryPoints: 2, defeatPoints: 1 },
          { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
        );
        unranked.forEach((element: "home" | "away") => {
          expect(result.ranked.map((x) => x.player)).not.toContain(element);
        });
      });

      test(`should have ${hasRankedSets ? "" : "no"} ranked sets`, () => {
        const result = generateMatchRank(
          match,
          { victoryPoints: 2, defeatPoints: 1 },
          { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
        );

        if (hasRankedSets) {
          expect(result.rankedSets).toBeTruthy();
        } else {
          expect(result.rankedSets).toEqual([]);
        }
      });
    }
  );
});
