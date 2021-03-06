import { TTGame, getGameWinner, parseGameScore } from "./tt-game";
import { TTGameRules } from "./rules";

describe("getGameWinner(...)", () => {
  test.each`
    homeScore | awayScore | scoreMinimum | scoreDistance | expected
    ${0}      | ${0}      | ${11}        | ${2}          | ${undefined}
    ${11}     | ${0}      | ${21}        | ${2}          | ${undefined}
    ${0}      | ${11}     | ${21}        | ${2}          | ${undefined}
    ${11}     | ${0}      | ${11}        | ${2}          | ${"home"}
    ${21}     | ${11}     | ${21}        | ${2}          | ${"home"}
    ${0}      | ${11}     | ${11}        | ${2}          | ${"away"}
    ${11}     | ${21}     | ${21}        | ${2}          | ${"away"}
    ${11}     | ${10}     | ${11}        | ${2}          | ${undefined}
    ${10}     | ${11}     | ${11}        | ${2}          | ${undefined}
    ${11}     | ${10}     | ${11}        | ${1}          | ${"home"}
    ${10}     | ${11}     | ${11}        | ${1}          | ${"away"}
    ${12}     | ${10}     | ${11}        | ${2}          | ${"home"}
    ${10}     | ${12}     | ${11}        | ${2}          | ${"away"}
  `(
    `Game at $homeScore-$awayScore (req: $scoreMinimum, min: $scoreDistance) the winner is $expected`,
    ({ homeScore, awayScore, scoreMinimum, scoreDistance, expected }) => {
      const game: TTGame = { homeScore, awayScore };
      const rules: TTGameRules = { scoreMinimum, scoreDistance };
      expect(getGameWinner(game, rules)).toBe(expected);
    }
  );
});

describe("parseGameScore(`...`)", () => {
  test.each([
    undefined,
    null,
    "",
    "a-a",
    "-1-0",
    "1.0",
    "1 0",
    "11-11a",
    "00",
    "99",
  ])("Should throw when input is `%p`", (input) => {
    const act = () => parseGameScore(input as string);
    expect(act).toThrow(/Unable to parse game score from: /);
  });

  test.each`
    home  | away  | input
    ${0}  | ${0}  | ${"0-0"}
    ${11} | ${0}  | ${"11-0"}
    ${0}  | ${11} | ${"0-11"}
    ${10} | ${12} | ${"10-12"}
  `("It should parse $input as $home-$away", ({ home, away, input }) => {
    const result = parseGameScore(input);
    expect(result.homeScore).toBe(home);
    expect(result.awayScore).toBe(away);
  });
});
