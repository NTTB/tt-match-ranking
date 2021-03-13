import { parseSetScore } from "../parsers";
import { TTMatch } from "../tt-match";
import { generateMatchRank, TTMatchRank } from "../tt-match-rank";

describe("generateMatchRank(...)", () => {
  let match: TTMatch<string>;
  beforeEach(() => {
    match = new TTMatch<string>();
  });

  test("should return an empty array when match contains no players", () => {
    const result = generateMatchRank(
      match,
      { victoryPoints: 2, defeatPoints: 1 },
      { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
    );
    expect(result.ranked).toEqual([]);
  });

  test("should return a single item when only one player is added", () => {
    match.addPlayer("Player 1");
    const result = generateMatchRank(
      match,
      { victoryPoints: 2, defeatPoints: 1 },
      { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
    );
    expect(result.ranked.length).toBe(1);
    expect(result.ranked[0].player).toBe("Player 1");
  });

  test("should return both items when two players were added", () => {
    match.addPlayer("Player 1");
    match.addPlayer("Player 2");
    const result = generateMatchRank(
      match,
      { victoryPoints: 2, defeatPoints: 1 },
      { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
    );
    expect(result.ranked.length).toBe(2);
    expect(result.ranked[0].player).toBe("Player 1");
    expect(result.ranked[1].player).toBe("Player 2");
  });

  describe.each`
    a_vs_b    | order
    ${"11-0"} | ${["A", "B"]}
    ${"0-11"} | ${["B", "A"]}
  `("Rank order of two players [$a_vs_b]", ({ a_vs_b, order }) => {
    let result: TTMatchRank<string>;
    beforeEach(() => {
      const A = match.addPlayer("A");
      const B = match.addPlayer("B");
      match.addSet(A, B, parseSetScore(a_vs_b));
      result = generateMatchRank(
        match,
        { victoryPoints: 2, defeatPoints: 1 },
        { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
      );
    });

    it("should have two ranked players", () => {
      expect(result.ranked).toHaveLength(2);
    });

    it("Should be ordered as " + order.join(), () => {
      expect(result.ranked.map((x) => x.player)).toEqual(order);
    });

    it("Winner has two points", () => {
      expect(result.ranked[0].points).toEqual(2);
    });

    it("Loser has a single point", () => {
      expect(result.ranked[1].points).toEqual(1);
    });
  });

  // Two specials scenarios:
  // Scenario 4: No sets are played
  // Scenario 5: One set was a walk-over, which means a player got 0 points instead of defeatpoints
  describe.each`
    a_vs_b    | a_vs_c    | a_vs_d    | b_vs_c    | b_vs_d    | c_vs_d       | rankedOrder | VPA  | VPB  | VPC  | VPD
    ${"0-11"} | ${"0-11"} | ${"0-11"} | ${"0-11"} | ${"0-11"} | ${"0-11"}    | ${"DCBA"}   | ${3} | ${4} | ${5} | ${6}
    ${"11-0"} | ${"0-11"} | ${"11-0"} | ${"11-0"} | ${"11-0"} | ${"0-11"}    | ${"ABDC"}   | ${5} | ${5} | ${4} | ${4}
    ${"0-11"} | ${"11-0"} | ${"11-0"} | ${"11-0"} | ${"0-11"} | ${"0-11"}    | ${"ABDC"}   | ${5} | ${5} | ${3} | ${5}
    ${""}     | ${""}     | ${""}     | ${""}     | ${""}     | ${""}        | ${"ABCD"}   | ${0} | ${0} | ${0} | ${0}
    ${"0-11"} | ${"11-0"} | ${"11-0"} | ${"11-0"} | ${"0-11"} | ${"wo:away"} | ${"BADC"}   | ${5} | ${5} | ${2} | ${5}
  `(
    "Rank order of four players [$a_vs_b, $a_vs_c, $a_vs_d, $b_vs_c, $b_vs_d, $c_vs_d]",
    ({
      a_vs_b,
      a_vs_c,
      a_vs_d,
      b_vs_c,
      b_vs_d,
      c_vs_d,
      rankedOrder,
      VPA,
      VPB,
      VPC,
      VPD,
    }) => {
      let result: TTMatchRank<string>;
      beforeEach(() => {
        const A = match.addPlayer("A");
        const B = match.addPlayer("B");
        const C = match.addPlayer("C");
        const D = match.addPlayer("D");
        match.addSet(A, B, parseSetScore(a_vs_b));
        match.addSet(A, C, parseSetScore(a_vs_c));
        match.addSet(A, D, parseSetScore(a_vs_d));
        match.addSet(B, C, parseSetScore(b_vs_c));
        match.addSet(B, D, parseSetScore(b_vs_d));
        match.addSet(C, D, parseSetScore(c_vs_d));
        result = generateMatchRank(
          match,
          { victoryPoints: 2, defeatPoints: 1 },
          { bestOf: 1, gameRules: { scoreDistance: 2, scoreMinimum: 11 } }
        );
      });

      it(`should have ${rankedOrder.length} ranked players`, () => {
        expect(result.ranked).toHaveLength(rankedOrder.length);
      });

      it(`Should be ordered as ${rankedOrder}`, () => {
        expect(result.ranked.map((x) => x.player).join("")).toEqual(
          rankedOrder
        );
      });

      it(`should have given player A: ${VPA} points`, () => {
        const playerResult = result.ranked.find((x) => x.player === "A");
        expect(playerResult?.points).toBe(VPA);
      });
      it(`should have given player B: ${VPB} points`, () => {
        const playerResult = result.ranked.find((x) => x.player === "B");
        expect(playerResult?.points).toBe(VPB);
      });
      it(`should have given player C: ${VPC} points`, () => {
        const playerResult = result.ranked.find((x) => x.player === "C");
        expect(playerResult?.points).toBe(VPC);
      });
      it(`should have given player D: ${VPD} points`, () => {
        const playerResult = result.ranked.find((x) => x.player === "D");
        expect(playerResult?.points).toBe(VPD);
      });
    }
  );
});
