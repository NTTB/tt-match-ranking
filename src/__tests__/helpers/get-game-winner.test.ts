import { getGameWinner } from "../../helpers/get-game-winner";
import { TTGameRules } from "../../rules";
import { TTGame } from "../../tt-game";

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
