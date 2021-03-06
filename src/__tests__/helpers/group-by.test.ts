import { groupBy } from "../../helpers";

describe("groupBy(...)", () => {
  it("should work with an empty array", () => {
    const act = () =>
      groupBy(
        [],
        (x) => x,
        (x) => x
      );
    expect(act).not.toThrow();
  });

  it("should return an array", () => {
    const result = groupBy(
      [],
      (x) => x,
      (x) => x
    );
    expect(Array.isArray(result)).toBeTruthy();
  });

  it("should group object based on key function", () => {
    const v1 = { k: 1, v: "v1" };
    const v2 = { k: 2, v: "v2" };
    const v3 = { k: 1, v: "v3" };
    const result = groupBy(
      [v1, v2, v3],
      (x) => x.k,
      (x) => x
    );
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe(1);
    expect(result[0].values).toHaveLength(2);
    expect(result[0].values).toContain(v1);
    expect(result[0].values).toContain(v3);

    expect(result[1].key).toBe(2);
    expect(result[1].values).toHaveLength(1);
    expect(result[1].values).toContain(v2);
  });

  it("should group object based on key function and map values", () => {
    const v1 = { k: 1, v: "v1" };
    const v2 = { k: 2, v: "v2" };
    const v3 = { k: 1, v: "v3" };
    const result = groupBy(
      [v1, v2, v3],
      (x) => x.k,
      (x) => x.v
    );
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe(1);
    expect(result[0].values).toHaveLength(2);
    expect(result[0].values).toContain("v1");
    expect(result[0].values).toContain("v3");

    expect(result[1].key).toBe(2);
    expect(result[1].values).toHaveLength(1);
    expect(result[1].values).toContain("v2");
  });

  it.each([null, undefined])("should throw with an %o array", (src) => {
    const act = () =>
      groupBy(
        (src as unknown) as [],
        (x) => x,
        (x) => x
      );
    expect(act).toThrowError("src must be an array");
  });
});
