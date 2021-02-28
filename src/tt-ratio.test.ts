import { TTRatio } from "./tt-ratio";
describe("TTRatio", () => {
  describe("TTRatio.Zero", () => {

    it("should have zero won", () => {
      expect(TTRatio.Zero.won).toBe(0);
    });
    it("should have zero lost", () => {
      expect(TTRatio.Zero.lost).toBe(0);
    });
  });

  describe("new TTRatio(...)", () => {
    it("should store the won value", () => {
      const result = new TTRatio(10, 5);
      expect(result.won).toBe(10);
    });

    it("should store the lost value", () => {
      const result = new TTRatio(10, 5);
      expect(result.lost).toBe(5);
    });
  });

  describe("TTRatio.ratio", () => {
    it.each`
      won | lost | ratio
      ${0} | ${0} | ${Number.NaN}
      ${1} | ${0} | ${Number.POSITIVE_INFINITY}
      ${2} | ${1} | ${2}
      ${1} | ${2} | ${0.5}
    `("should be $ratio with $won wins and $lost lost", ({ won, lost, ratio }) => {
      const result = new TTRatio(won, lost);
      expect(result.ratio).toBe(ratio);
    });
  });

  describe("TTRatio.sum(...)", () => {
    it('should combine ratios', () => {
      const a = new TTRatio(1, 2);
      const b = new TTRatio(3, 5);
      const c = new TTRatio(8, 13);
      const d = TTRatio.sum(a, b, c);
      expect(d.won).toBe(12);
      expect(d.lost).toBe(20);
    });
  });
});