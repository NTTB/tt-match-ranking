import { assertMatchRules } from "../../rules";

describe("assertMatchRules(...)", () => {
  test("should throw when lose score is higher equal to win score", () => {
    const act = () => assertMatchRules({ victoryPoints: 0, defeatPoints: 0 });
    expect(act).toThrowError(
      /The victoryPoints should be higher than the defeatPoints/
    );
  });

  test("should throw when lose score is negative", () => {
    const act = () => assertMatchRules({ victoryPoints: 0, defeatPoints: -1 });
    expect(act).toThrowError(/The defeatPoints must be zero or positive/);
  });

  test.each`
    winning | losing
    ${2}    | ${1}
    ${1}    | ${0}
  `(
    "should not throw when a valid configuration is provided",
    ({ winning, losing }) => {
      const act = () =>
        assertMatchRules({ victoryPoints: winning, defeatPoints: losing });
      expect(act).not.toThrow();
    }
  );
});
