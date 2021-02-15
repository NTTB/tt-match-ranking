import { TTSet, TTSetRules, getSetWinner, parseSetScore } from "./tt-set";
import { parseGameScore, TTGameRules } from "./tt-game";

const gameTo11: TTGameRules = { scoreMinimum: 11, scoreDistance: 2 };

describe("parseSetScore(...)", () => {
  test("empty string result in no games", () => {
    const games = parseSetScore("");
    expect(games.length).toBe(0);
  });

  describe.each`
  game1 | input
  ${"0-0"} | ${"0-0"}
  ${"11-0"} | ${"11-0"}
  ${"0-11"} | ${"0-11"}
  ${"10-12"} | ${"10-12"}
  `("Single game of $input", ({ game1, input }) => {
    const expectedGames = [parseGameScore(game1)];
    const games = parseSetScore(input);

    test(`The correct amount of games`, () => expect(games.length).toBe(1));
    expectedGames.forEach((eg, i) => {
      test(`games[${i}].homeScore == ${eg.homeScore}`, () => expect(games[i].homeScore).toBe(eg.homeScore));
      test(`games[${i}].awayScore == ${eg.awayScore}`, () => expect(games[i].awayScore).toBe(eg.awayScore));
    });
  });

  describe.each`
  game1      | game2      | input
  ${"0-0"}   | ${"0-0"}   | ${"0-0,0-0"}
  ${"0-0"}   | ${"0-0"}   | ${"0-0, 0-0"}
  ${"11-0"}  | ${"11-0"}  | ${"11-0, 11-0"}
  ${"0-11"}  | ${"0-11"}  | ${"0-11, 0-11"}
  ${"10-12"} | ${"10-12"} | ${"10-12, 10-12"}
  ${"10-12"} | ${"7-5"}   | ${"10-12, 7-5"}
  `("Single game of $input", ({ game1, game2, input }) => {
    const expectedGames = [parseGameScore(game1), parseGameScore(game2)];
    const games = parseSetScore(input);

    test(`The correct amount of games`, () => expect(games.length).toBe(2));
    expectedGames.forEach((eg, i) => {
      test(`games[${i}].homeScore == ${eg.homeScore}`, () => expect(games[i].homeScore).toBe(eg.homeScore));
      test(`games[${i}].awayScore == ${eg.awayScore}`, () => expect(games[i].awayScore).toBe(eg.awayScore));
    });
  });
});

describe("getSetWinner(...)", () => {
  test("should throw when gameRules are missing", () => {
    var set: TTSet = { games: [] };
    var rules: TTSetRules = { gameRules: undefined, bestOf: 1 };

    expect(() => getSetWinner(set, rules)).toThrow(/The gameRules are undefined in the setRules/);
  });

  test("should work with empty games array", () => {
    var set: TTSet = { games: [] };
    var rules: TTSetRules = { gameRules: gameTo11, bestOf: 1 };
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
    ${3}   | ${undefined} | ${"11-0,  0-11, 0-0"}
    ${3}   | ${"home"}    | ${"11-0,  0-11, 11-0, 10-12, 10-12"}
    ${5}   | ${"away"}    | ${"11-0, 10-12, 11-0, 10-12, 10-12"}
  `("With $bestOf and games of $games the winner is $winner", ({ bestOf, winner, games }) => {
    var rules: TTSetRules = { bestOf: bestOf, gameRules: gameTo11 };
    var set: TTSet = { games: parseSetScore(games) };
    expect(getSetWinner(set, rules)).toBe(winner);
  });
});

