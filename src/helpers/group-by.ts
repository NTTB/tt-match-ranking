interface GroupBy<TKey, TValue> {
  key: TKey;
  values: TValue[];
}

/**
 * @internal
 * Groups values in an array
 * @param src The source array which needs to be grouped
 * @param keySelector A function to select the key value to group by
 * @param valueSelector A function to select the value that will be stored in the group
 * @returns An array of groups that were found
 */
export function groupBy<TSrc, TKey, TVal = TSrc>(
  src: TSrc[],
  keySelector: (v: TSrc) => TKey,
  valueSelector: (v: TSrc) => TVal
): GroupBy<TKey, TVal>[] {
  if (typeof src === "undefined" || src === null) {
    throw new Error("src must be an array");
  }

  return src.reduce((pv: GroupBy<TKey, TVal>[], cv) => {
    const objKey = keySelector(cv);
    const objVal = valueSelector(cv);
    const foundGroup = pv.find((x) => x.key == objKey);
    if (foundGroup) {
      foundGroup.values.push(objVal);
      return pv;
    } else {
      const newGroup: GroupBy<TKey, TVal> = { key: objKey, values: [objVal] };
      return [...pv, newGroup];
    }
  }, []);
}
