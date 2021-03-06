import { parseGameScore } from "../../parsers";

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
