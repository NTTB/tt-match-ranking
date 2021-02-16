import { validateGameRules } from "./tt-game-rules";

test("should throw when scoreMinimum is lower than scoreDistance ", () => {
  const call = () => validateGameRules({ scoreMinimum: 1, scoreDistance: 2 });
  expect(call).toThrow(/The scoreMinimum in game-rules must be larger or equel to scoreDistance/);
});

test.each([0, -1])("should throw when scoreDistance is %d because that is too low", (scoreDistance) => {
  const call = () => validateGameRules({ scoreMinimum: 0, scoreDistance });
  expect(call).toThrow(/The scoreDistance in game-rules must be larger or equel to 1/);
});