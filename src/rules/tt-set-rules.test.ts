import { TTGameRules } from "./tt-game-rules";
import { assertSetRules, TTSetRules } from "./tt-set-rules";

test("should throw when gameRules are missing", () => {
  const rules: TTSetRules = {
    gameRules: (undefined as unknown) as TTGameRules,
    bestOf: 1,
  };

  expect(() => assertSetRules(rules)).toThrow(
    /The gameRules are undefined in the setRules/
  );
});
