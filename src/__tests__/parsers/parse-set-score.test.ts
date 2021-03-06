import { parseGameScore, parseSetScore } from "../../parsers";

describe("parseSetScore(...)", () => {
  test("empty string result in no games", () => {
    const { games, walkover } = parseSetScore("");
    expect(games.length).toBe(0);
    expect(walkover).toBeUndefined();
  });

  describe.each`
    game1      | input
    ${"0-0"}   | ${"0-0"}
    ${"11-0"}  | ${"11-0"}
    ${"0-11"}  | ${"0-11"}
    ${"10-12"} | ${"10-12"}
  `("Single game of $input", ({ game1, input }) => {
    const expectedGames = [parseGameScore(game1)];
    const { games, walkover } = parseSetScore(input);

    test(`The correct amount of games`, () => expect(games.length).toBe(1));
    expectedGames.forEach((eg, i) => {
      test(`games[${i}].homeScore == ${eg.homeScore}`, () =>
        expect(games[i].homeScore).toBe(eg.homeScore));
      test(`games[${i}].awayScore == ${eg.awayScore}`, () =>
        expect(games[i].awayScore).toBe(eg.awayScore));
      test(`No walkover`, () => expect(walkover).toBeUndefined());
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
    const { games, walkover } = parseSetScore(input);

    test(`The correct amount of games`, () => expect(games.length).toBe(2));
    test(`No walkover`, () => expect(walkover).toBeUndefined());
    expectedGames.forEach((eg, i) => {
      test(`games[${i}].homeScore == ${eg.homeScore}`, () =>
        expect(games[i].homeScore).toBe(eg.homeScore));
      test(`games[${i}].awayScore == ${eg.awayScore}`, () =>
        expect(games[i].awayScore).toBe(eg.awayScore));
    });
  });

  test.each`
    walkover  | input
    ${"home"} | ${"wo:home"}
    ${"away"} | ${"wo:away"}
  `(
    'When input is "$input" it should have no game and set winner by walkover to $walkover',
    ({ walkover, input }) => {
      const set = parseSetScore(input);
      expect(set.games.length).toBe(0);
      expect(set.walkover).toBe(walkover);
    }
  );
});
