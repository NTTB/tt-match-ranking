import { assertMatchRules, parseMatchRules } from "./tt-match-rules";

describe.each`
  winning | losing | input
  ${1}    | ${0}   | ${"+1/0"}
  ${2}    | ${0}   | ${"+2/0"}
  ${2}    | ${1}   | ${"+2/1"}
`('parseMatchRules("$input")', ({ winning, losing, input }) => {
  const rules = parseMatchRules(input);
  test(`should set victoryPoints to ${winning}`, () =>
    expect(rules.victoryPoints).toBe(winning));
  test(`should set defeatPoints to ${losing}`, () =>
    expect(rules.defeatPoints).toBe(losing));
});

describe("parseMatchRules input validation", () => {
  test('parseMatchRules("0/0") should throw', () => {
    const act = () => parseMatchRules("0/0");
    expect(act).toThrowError(/Unable to parse match rules from/);
  });

  test("parseMatchRules(null) should throw", () => {
    const act = () => parseMatchRules((null as unknown) as string);
    expect(act).toThrowError(/Unable to parse match rules from/);
  });

  test("parseMatchRules(undefined) should throw", () => {
    const act = () => parseMatchRules((undefined as unknown) as string);
    expect(act).toThrowError(/Unable to parse match rules from/);
  });

  test('parseMatchRules("invalidString") should throw', () => {
    const act = () => parseMatchRules("invalidString");
    expect(act).toThrowError(/Unable to parse match rules from/);
  });
});

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
