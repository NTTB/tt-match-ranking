import { assertSetRules, TTGameRules, TTSetRules } from "../../rules";

describe("TTSetRules", () => {
  it("should throw when gameRules are missing", () => {
    const rules: TTSetRules = {
      gameRules: (undefined as unknown) as TTGameRules,
      bestOf: 1,
    };

    expect(() => assertSetRules(rules)).toThrow(
      /The gameRules are undefined in the setRules/
    );
  });

  it("should throw when bestOf is smaller than 1", () => {
    const rules: TTSetRules = {
      gameRules: { scoreDistance: 2, scoreMinimum: 11 },
      bestOf: 0,
    };

    expect(() => assertSetRules(rules)).toThrow(
      /bestOf should be larger or equal than 1/
    );
  });
});
