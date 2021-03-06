import { TTMatch } from "./tt-match";
import { generateMatchRank, TTMatchRank } from "./tt-match-rank";
import { parseSetScore } from "./tt-set";

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
    set1         | set2         | set3         | ranked              | unranked
    ${""}        | ${""}        | ${""}        | ${["home", "away"]} | ${[]}
    ${"0-0"}     | ${"0-0"}     | ${"0-0"}     | ${["home", "away"]} | ${[]}
    ${""}        | ${"0-0"}     | ${""}        | ${["home", "away"]} | ${[]}
    ${""}        | ${""}        | ${"wo:home"} | ${["home", "away"]} | ${[]}
    ${""}        | ${""}        | ${"wo:away"} | ${["home", "away"]} | ${[]}
    ${""}        | ${"wo:home"} | ${"wo:home"} | ${[]}               | ${["home", "away"]}
    ${""}        | ${"wo:away"} | ${"wo:away"} | ${[]}               | ${["home", "away"]}
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${[]}               | ${["home", "away"]}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${[]}               | ${["home", "away"]}
    ${"wo:home"} | ${"wo:home"} | ${"wo:away"} | ${[]}               | ${["home", "away"]}
    ${"wo:home"} | ${"wo:away"} | ${"wo:away"} | ${[]}               | ${["home", "away"]}
    ${"wo:home"} | ${""}        | ${"wo:away"} | ${[]}               | ${["home", "away"]}
  `(
    "When sets are [$set1, $set2, $set3]",
    ({ set1, set2, set3, ranked, unranked }) => {
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
    }
  );

  describe.each`
    s1_2         | s1_3         | s1_4         | s2_3         | s2_4         | s3_4         | ranked    | unranked
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${""}     | ${"ABCD"}
    ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"ABCD"} | ${""}
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"BCD"}  | ${"A"}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"BCD"}  | ${"A"}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${"0-11"}    | ${"0-11"}    | ${"D"}    | ${"ABC"}
  `(
    "Given sets are [$s1_2, $s1_3, $s1_4, $s2_3, $s2_4, $s3_4]",
    ({
      s1_2,
      s1_3,
      s1_4,
      s2_3,
      s2_4,
      s3_4,
      ranked,
      unranked,
    }: {
      s1_2: string;
      s1_3: string;
      s1_4: string;
      s2_3: string;
      s2_4: string;
      s3_4: string;
      ranked: string;
      unranked: string;
    }) => {
      match = new TTMatch<string>();
      const p1 = match.addPlayer("A");
      const p2 = match.addPlayer("B");
      const p3 = match.addPlayer("C");
      const p4 = match.addPlayer("D");
      match.addSet(p1, p2, parseSetScore(s1_2));
      match.addSet(p1, p3, parseSetScore(s1_3));
      match.addSet(p1, p4, parseSetScore(s1_4));
      match.addSet(p2, p3, parseSetScore(s2_3));
      match.addSet(p2, p4, parseSetScore(s2_4));
      match.addSet(p3, p4, parseSetScore(s3_4));
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
    }
  );

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

  describe.each`
    a_vs_b    | a_vs_c    | a_vs_d    | b_vs_c    | b_vs_d    | c_vs_d       | rankedOrder | VPA  | VPB  | VPC  | VPD
    ${""}     | ${""}     | ${""}     | ${""}     | ${""}     | ${""}        | ${"ABCD"}   | ${0} | ${0} | ${0} | ${0}
    ${"0-11"} | ${"0-11"} | ${"0-11"} | ${"0-11"} | ${"0-11"} | ${"0-11"}    | ${"DCBA"}   | ${3} | ${4} | ${5} | ${6}
    ${"11-0"} | ${"0-11"} | ${"11-0"} | ${"11-0"} | ${"11-0"} | ${"0-11"}    | ${"ABDC"}   | ${5} | ${5} | ${4} | ${4}
    ${"0-11"} | ${"11-0"} | ${"11-0"} | ${"11-0"} | ${"0-11"} | ${"0-11"}    | ${"ABDC"}   | ${5} | ${5} | ${3} | ${5}
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
