import { getSetWinner } from "../../helpers";
import { parseSetScore } from "../../parsers";
import { TTGameRules, TTSetRules } from "../../rules";
import { TTSet } from "../../tt-set";

const gameTo11: TTGameRules = { scoreMinimum: 11, scoreDistance: 2 };

describe("getSetWinner(...)", () => {
  test("should work with empty games array", () => {
    const set: TTSet = { games: [] };
    const rules: TTSetRules = { gameRules: gameTo11, bestOf: 1 };
    expect(getSetWinner(set, rules)).toBeUndefined();
  });

  test.each`
    bestOf | winner       | games
    ${1}   | ${undefined} | ${"0-0"}
    ${1}   | ${undefined} | ${"10-0"}
    ${1}   | ${"home"}    | ${"11-0"}
    ${1}   | ${"away"}    | ${"10-12"}
    ${3}   | ${"home"}    | ${"11-0, 11-0"}
    ${3}   | ${"away"}    | ${"0-11, 10-12"}
    ${3}   | ${undefined} | ${"11-0"}
    ${3}   | ${undefined} | ${"11-0,  0-11, 0-0"}
    ${3}   | ${"home"}    | ${"11-0,  0-11, 11-0, 10-12, 10-12"}
    ${5}   | ${"away"}    | ${"11-0, 10-12, 11-0, 10-12, 10-12"}
  `(
    "With $bestOf and games of $games the winner is $winner",
    ({ bestOf, winner, games }) => {
      const rules: TTSetRules = { bestOf: bestOf, gameRules: gameTo11 };
      const set: TTSet = parseSetScore(games);
      expect(getSetWinner(set, rules)).toBe(winner);
    }
  );
});
