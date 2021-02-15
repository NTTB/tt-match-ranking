import { TTGame, getGameAdvantage, getGameWinner, TTGameRules, parseGameScore } from './tt-game';

describe("getGameAdvantage(...)", () => {
  test.each`
    homeScore | awayScore | expected
    ${0}      | ${0}      | ${undefined}
    ${1}      | ${0}      | ${"home"}
    ${99}     | ${0}      | ${"home"}
    ${99}     | ${98}     | ${"home"}
    ${0}      | ${1}      | ${"away"}
    ${0}      | ${99}     | ${"away"}
    ${98}     | ${99}     | ${"away"}
    ${99}     | ${99}     | ${undefined}
  `(`At $homeScore - $awayScore the advantage is $expected`, ({ homeScore, awayScore, expected }) => {
    const game: TTGame = { homeScore, awayScore };
    expect(getGameAdvantage(game)).toBe(expected);
  });
});

describe("getGameWinner(...)", () => {
  test("should throw when scoreMinimum is lower than scoreDistance ", () => {
    const call = () => getGameWinner(undefined, { scoreMinimum: 1, scoreDistance: 2 });
    expect(call).toThrow(/The scoreMinimum in game-rules must be larger or equel to scoreDistance/);
  });

  test.each([0, -1])("should throw when scoreDistance is %d because that is too low", (scoreDistance) => {
    const call = () => getGameWinner(undefined, { scoreMinimum: 0, scoreDistance });
    expect(call).toThrow(/The scoreDistance in game-rules must be larger or equel to 1/);
  });

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
  `(`Game at $homeScore-$awayScore (req: $scoreMinimum, min: $scoreDistance) the winner is $expected`,
    ({ homeScore, awayScore, scoreMinimum, scoreDistance, expected }) => {
      const game: TTGame = { homeScore, awayScore };
      const rules: TTGameRules = { scoreMinimum, scoreDistance };
      expect(getGameWinner(game, rules)).toBe(expected);
    });
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
  ])("Should throw", (input) => {
    const act = () => parseGameScore(input);
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
})