import { WinLoseRatio } from "../../helpers";

describe("WinLoseRatio", () => {
  describe("WinLoseRatio.Zero", () => {
    it("should have zero won", () => {
      expect(WinLoseRatio.Zero.won).toBe(0);
    });

    it("should have zero lost", () => {
      expect(WinLoseRatio.Zero.lost).toBe(0);
    });
  });

  describe("new WinLoseRatio(...)", () => {
    it("should store the won value", () => {
      const result = new WinLoseRatio(10, 5);
      expect(result.won).toBe(10);
    });

    it("should store the lost value", () => {
      const result = new WinLoseRatio(10, 5);
      expect(result.lost).toBe(5);
    });
  });

  describe("WinLoseRatio.ratio", () => {
    it.each`
      won  | lost | ratio
      ${0} | ${0} | ${Number.NaN}
      ${1} | ${0} | ${Number.POSITIVE_INFINITY}
      ${2} | ${1} | ${2}
      ${1} | ${2} | ${0.5}
    `(
      "should be $ratio with $won wins and $lost lost",
      ({ won, lost, ratio }) => {
        const result = new WinLoseRatio(won, lost);
        expect(result.ratio).toBe(ratio);
      }
    );
  });

  describe("WinLoseRatio.sum(...)", () => {
    it("should combine ratios", () => {
      const a = new WinLoseRatio(1, 2);
      const b = new WinLoseRatio(3, 5);
      const c = new WinLoseRatio(8, 13);
      const d = WinLoseRatio.sum(a, b, c);
      expect(d.won).toBe(12);
      expect(d.lost).toBe(20);
    });
  });
});
