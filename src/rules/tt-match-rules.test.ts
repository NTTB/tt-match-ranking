import { assertMatchRules } from "./tt-match-rules";

describe("assertMatchRules(...)", () => {
  test("should throw when lose score is higher equal to win score", () => {
    const act = () => assertMatchRules({ pointsPerWin: 0, pointsPerLose: 0 });
    expect(act).toThrowError(/The pointsPerWin should be higher than the pointsPerLose/);
  });
  test("should throw when lose score is negative", () => {
    const act = () => assertMatchRules({ pointsPerWin: 0, pointsPerLose: -1 });
    expect(act).toThrowError(/The pointsPerLose must be zero or positive/);
  });

  test.each`
    winning | losing
    ${2}    | ${1}
    ${1}    | ${0}
  `("should not throw when a valid configuration is provided", ({ winning, losing }) => {
    const act = () => assertMatchRules({ pointsPerWin: winning, pointsPerLose: losing });
    expect(act).not.toThrow();
  });
});