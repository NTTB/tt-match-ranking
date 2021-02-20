import { TTMatch } from "./tt-match";
import { generateMatchRank } from "./tt-match-rank";
import { parseSetScore } from "./tt-set";

describe("generateMatchRank(...)", () => {
  let match: TTMatch<string>;
  beforeEach(() => {
    match = new TTMatch<string>();
  });

  test("should return an empty array when match contains no players", () => {
    var result = generateMatchRank(match);
    expect(result.ranked).toEqual([]);
  });

  test("should return a single item when only one player is added", () => {
    match.addPlayer("Player 1");
    var result = generateMatchRank(match);
    expect(result.ranked.length).toBe(1);
    expect(result.ranked[0].player).toBe("Player 1");
  });

  test("should return both items when two players were added", () => {
    match.addPlayer("Player 1");
    match.addPlayer("Player 2");
    var result = generateMatchRank(match);
    expect(result.ranked.length).toBe(2);
    expect(result.ranked[0].player).toBe("Player 1");
    expect(result.ranked[1].player).toBe("Player 2");
  });

  describe.each`
    set1         | set2         | set3         | ranked              | unranked
    ${""}        | ${""}        | ${""}        | ${["home", "away"]} | ${[]}
    ${""}        | ${""}        | ${"wo:home"} | ${["home", "away"]} | ${[]}
    ${""}        | ${""}        | ${"wo:away"} | ${["home", "away"]} | ${[]}
    ${""}        | ${"wo:home"} | ${"wo:home"} | ${[]}               | ${["home", "away"]}
    ${""}        | ${"wo:away"} | ${"wo:away"} | ${[]}               | ${["home", "away"]}
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${[]}               | ${["home", "away"]}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${[]}               | ${["home", "away"]}
    ${"wo:home"} | ${"wo:home"} | ${"wo:away"} | ${[]}               | ${["home", "away"]}
    ${"wo:home"} | ${"wo:away"} | ${"wo:away"} | ${[]}               | ${["home", "away"]}
    ${"wo:home"} | ${""}        | ${"wo:away"} | ${[]}               | ${["home", "away"]}
  `("When sets are [$set1, $set2, $set3]", ({ set1, set2, set3, ranked, unranked }) => {
    beforeEach(() => {
      const p1 = match.addPlayer("home");
      const p2 = match.addPlayer("away");
      match.addSet(parseSetScore(set1), p1, p2);
      match.addSet(parseSetScore(set2), p1, p2);
      match.addSet(parseSetScore(set3), p1, p2);
    });

    test(`${ranked.join(",") || "none"} should be ranked`, () => {
      const result = generateMatchRank(match);
      ranked.forEach((element: "home" | "away") => {
        expect(result.ranked.map(x => x.player)).toContain(element);
      });
    });


    test(`${unranked.join(",") || "none"} must NOT be ranked`, () => {
      const result = generateMatchRank(match);
      unranked.forEach((element: "home" | "away") => {
        expect(result.ranked.map(x => x.player)).not.toContain(element);
      });
    });
  });

  describe.each`
    s1_2         | s1_3         | s1_4         | s2_3          | s2_4         | s3_4         | ranked    | unranked 
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"wo:home"}  | ${"wo:home"} | ${"wo:home"} | ${""}     | ${"ABCD"}
    ${"0-11"}    | ${"0-11"}    | ${"0-11"}    | ${"0-11"}     | ${"0-11"}    | ${"0-11"}    | ${"ABCD"} | ${""}
    ${"wo:home"} | ${"wo:home"} | ${"wo:home"} | ${"0-11"}     | ${"0-11"}    | ${"0-11"}    | ${"BCD"}  | ${"A"}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${"0-11"}     | ${"0-11"}    | ${"0-11"}    | ${"BCD"}  | ${"A"}
    ${"wo:away"} | ${"wo:away"} | ${"wo:away"} | ${"wo:away"}  | ${"0-11"}    | ${"0-11"}    | ${"D"}    | ${"ABC"}
      `("Given sets are [$s1_2, $s1_3, $s1_4, $s2_3, $s2_4, $s3_4]", (
    { s1_2, s1_3, s1_4, s2_3, s2_4, s3_4, ranked, unranked }: { s1_2: string, s1_3: string, s1_4: string, s2_3: string, s2_4: string, s3_4: string, ranked: string, unranked: string }
  ) => {
    match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    const p3 = match.addPlayer("C");
    const p4 = match.addPlayer("D");
    match.addSet(parseSetScore(s1_2), p1, p2);
    match.addSet(parseSetScore(s1_3), p1, p3);
    match.addSet(parseSetScore(s1_4), p1, p4);
    match.addSet(parseSetScore(s2_3), p2, p3);
    match.addSet(parseSetScore(s2_4), p2, p4);
    match.addSet(parseSetScore(s3_4), p3, p4);
    const result = generateMatchRank(match);

    for (var i = 0; i < ranked.length; ++i) {
      const player = ranked[i];
      test(`player ${player} should be ranked`, () => {
        expect(result.ranked.map(x => x.player)).toContain(player);
      });
    }

    for (var i = 0; i < unranked.length; ++i) {
      const player = unranked[i];
      test(`player ${player} should NOT be ranked`, () => {
        expect(result.ranked.map(x => x.player)).not.toContain(player);
      });
    }

    test(`total ranked players should be ${ranked.length}`, () => {
      expect(result.ranked).toHaveLength(ranked.length);
    });
  });
});