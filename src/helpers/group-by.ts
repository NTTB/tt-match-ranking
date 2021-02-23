interface GroupBy<TKey, TValue> {
  key: TKey;
  values: TValue[];
}

export function groupBy<TSrc, TKey, TVal = TSrc>(
  src: TSrc[],
  keySelector: (v: TSrc) => TKey,
  valueSelector: (v: TSrc) => TVal
): GroupBy<TKey, TVal>[] {
  return src.reduce((pv: GroupBy<TKey, TVal>[], cv) => {
    const objKey = keySelector(cv);
    const objVal = valueSelector(cv);
    const foundGroup = pv.find((x) => x.key == objKey);
    if (foundGroup) {
      foundGroup.values.push(objVal);
      return pv;
    } else {
      const newGroup: GroupBy<TKey, TVal> = { key: objKey, values: [objVal] };
      return [newGroup, ...pv];
    }
  }, []);
}
