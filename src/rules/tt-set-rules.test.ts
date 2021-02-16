import { assertSetRules, TTSetRules } from "./tt-set-rules";

test("should throw when gameRules are missing", () => {
  var rules: TTSetRules = { gameRules: undefined as any, bestOf: 1 };

  expect(() => assertSetRules(rules)).toThrow(/The gameRules are undefined in the setRules/);
});