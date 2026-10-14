import fc from "fast-check";
import lodashOrderBy from "lodash/orderBy";
import {describe, expect, it} from "vitest";

import {multisort, orderBy, orderByColumns, type SortColumn} from "../src/index.ts";

const column = (keys: unknown[], extra: Partial<SortColumn> = {}): SortColumn => ({
  keys,
  desc: false,
  specialClass: () => 0,
  specialsFirst: false,
  ...extra,
});

const distinct = <T>(items: T[]) => new Set(items).size;

describe("result is a permutation of the input", () => {
  it("keeps the trailing null bucket after a sorted run", () => {
    const rows = Array.from({length: 129}, (_, id) => ({id, x: id === 128 ? null : id}));
    const out = orderBy(rows, ["x"]);
    expect(distinct(out)).toBe(129);
    expect(out.at(-1)?.id).toBe(128);
  });

  it("keeps the trailing null bucket on a sorted secondary column", () => {
    const rows = Array.from({length: 200}, (_, id) => ({id, a: id % 2, b: id === 199 ? null : id}));
    const out = orderBy(rows, ["a", "b"]);
    expect(distinct(out)).toBe(200);
    expect(out.map((r) => r.id)).toEqual(lodashOrderBy(rows, ["a", "b"]).map((r) => r.id));
  });

  it("keeps nulls last on a descending sorted run in multisort", () => {
    const rows = Array.from({length: 150}, (_, id) => ({id, x: id === 149 ? null : 150 - id}));
    const out = multisort(rows, [{by: "x", order: "desc", nulls: "last"}]);
    expect(distinct(out)).toBe(150);
    expect(out.at(-1)?.id).toBe(149);
  });

  it("survives a nested sort from a custom comparator", () => {
    const rows = Array.from({length: 256}, (_, id) => ({id, a: (id * 29) % 16, b: 255 - id}));
    let called = false;
    const compare = (a: unknown, b: unknown) => {
      if (!called) {
        called = true;
        orderBy(
          Array.from({length: 256}, (_, i) => (i * 71) % 256),
          [(x) => x]
        );
      }
      return (a as number) - (b as number);
    };
    const out = orderByColumns(rows, [column(rows.map((x) => x.a)), column(rows.map((x) => x.b), {compare})]);
    expect(distinct(out)).toBe(256);
    expect(out.map((x) => x.id)).toEqual(lodashOrderBy(rows, ["a", "b"]).map((x) => x.id));
  });

  it("survives a nested sort from specialClass", () => {
    const rows = Array.from({length: 256}, (_, id) => ({id, a: (id * 29) % 16, b: 255 - id}));
    let called = false;
    const specialClass = () => {
      if (!called) {
        called = true;
        orderBy(
          Array.from({length: 300}, (_, i) => (i * 71) % 300),
          [(x) => x]
        );
      }
      return 0;
    };
    const out = orderByColumns(rows, [column(rows.map((x) => x.a)), column(rows.map((x) => x.b), {specialClass})]);
    expect(distinct(out)).toBe(256);
  });

  it("holds for every size around the path thresholds with specials last", () => {
    fc.assert(
      fc.property(
        fc.integer({min: 2, max: 300}),
        fc.integer({min: 1, max: 6}),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (n, groups, desc, sortedFirst, strings) => {
          const rows = Array.from({length: n}, (_, id) => ({
            id,
            a: sortedFirst ? Math.floor(id / 7) : (id * 31) % groups,
            b: id === n - 1 ? null : strings ? `k${(id * 17) % 23}` : (id * 17) % 23,
          }));
          const orders: Array<"asc" | "desc"> = ["asc", desc ? "desc" : "asc"];
          const out = orderBy(rows, ["a", "b"], orders);
          expect(distinct(out)).toBe(n);
          expect(out.map((x) => x.id)).toEqual(lodashOrderBy(rows, ["a", "b"], orders).map((x) => x.id));
        }
      ),
      {numRuns: 400}
    );
  });
});

describe("public contract", () => {
  it("calls iteratees with the item only", () => {
    expect(orderBy(["10", "2", "1"], [parseInt])).toEqual(["1", "2", "10"]);
    expect(orderBy(["10", "2", "1"], [parseInt, () => 0])).toEqual(["1", "2", "10"]);
    expect(multisort(["10", "2", "1"], [{by: parseInt}])).toEqual(["1", "2", "10"]);
  });

  it("reads holes as undefined on every path", () => {
    const rows = [2, , 1] as Array<number | undefined>;
    const get = (x: number | undefined) => x ?? -1;
    expect(orderBy(rows, [get])).toEqual([undefined, 1, 2]);
    expect(orderBy(rows, [get, () => 0])).toEqual([undefined, 1, 2]);
    expect(multisort(rows, [{by: get}])).toEqual([undefined, 1, 2]);
  });

  it("adding a constant last criterion never changes the result", () => {
    const key = fc.oneof(fc.integer({min: -3, max: 3}), fc.constantFrom<unknown>(null, undefined, "a", "b", NaN));
    fc.assert(
      fc.property(
        fc.array(fc.record({a: key, b: key}), {maxLength: 200}),
        fc.array(fc.constantFrom("asc" as const, "desc" as const), {maxLength: 2}),
        (items, orders) => {
          const rows = items.map((item, id) => ({...item, id}));
          const base = orderBy(rows, ["a", "b"], orders).map((x) => x.id);
          expect(orderBy(rows, ["a", "b", () => 0], orders).map((x) => x.id)).toEqual(base);
        }
      ),
      {numRuns: 300}
    );
  });

  it("matches lodash on mixed string and number secondary keys in tiny arrays", () => {
    const rows = [
      {id: 0, a: "b", b: 0},
      {id: 1, a: "b", b: "x"},
      {id: 2, a: "a", b: 0},
      {id: 3, a: "b", b: 1},
    ];
    const orders: Array<"asc" | "desc"> = ["asc", "desc"];
    expect(orderBy(rows, ["a", "b"], orders).map((x) => x.id)).toEqual(
      lodashOrderBy(rows, ["a", "b"], orders).map((x) => x.id)
    );
  });

  it("matches lodash on mixed secondary keys for any tiny array", () => {
    const key = fc.constantFrom<unknown>(0, 1, "x", "y", null, undefined);
    fc.assert(
      fc.property(
        fc.array(fc.record({a: fc.constantFrom("a", "b", "c"), b: key, c: key}), {maxLength: 40}),
        fc.array(fc.constantFrom("asc" as const, "desc" as const), {maxLength: 3}),
        (items, orders) => {
          const rows = items.map((item, id) => ({...item, id}));
          expect(orderBy(rows, ["a", "b", "c"], orders).map((x) => x.id)).toEqual(
            lodashOrderBy(rows, ["a", "b", "c"], orders).map((x) => x.id)
          );
        }
      ),
      {numRuns: 500}
    );
  });

  it("returns a copy for empty rules", () => {
    expect(multisort([2, 1], [])).toEqual([2, 1]);
    expect(orderByColumns([2, 1], [])).toEqual([2, 1]);
    const big = Array.from({length: 200}, (_, i) => 200 - i);
    expect(orderByColumns(big, [])).toEqual(big);
  });

  it("treats a boxed symbol like lodash", () => {
    const rows = [{x: Object(Symbol("x"))}, {x: 0}, {x: null}];
    expect(orderBy(rows, ["x"]).map((r) => r.x)).toEqual(lodashOrderBy(rows, ["x"]).map((r) => r.x));
  });

  it("reads a property shorthand through nullish rows like lodash", () => {
    const rows = [{x: 1}, null, {x: 0}];
    expect(orderBy(rows, ["x" as never])).toEqual(lodashOrderBy(rows, ["x"]));
  });
});

describe("orderByColumns contract", () => {
  it("never bypasses a custom comparator on ordered input", () => {
    expect(orderByColumns([1, 2, 3], [column([1, 2, 3], {compare: (a, b) => (b as number) - (a as number)})])).toEqual([
      3, 2, 1,
    ]);
  });

  it("treats keys in one special class as equal", () => {
    expect(orderByColumns(["a", "b"], [column([NaN, NaN], {desc: true, specialClass: () => 1})])).toEqual(["a", "b"]);
  });

  it("treats a NaN comparator result as a tie", () => {
    expect(
      orderByColumns(
        [2, 1],
        [column([Infinity, Infinity], {compare: (a, b) => (a as number) - (b as number)}), column([2, 1])]
      )
    ).toEqual([1, 2]);
  });

  it("rejects a keys array that does not match the items", () => {
    expect(() => orderByColumns([1, 2, 3], [column([1, 2])])).toThrow(RangeError);
  });

  it("accepts any number as a special class id", () => {
    const rows = [3, 1, 2, 4];
    const specialClass = (key: unknown) => (key === 4 ? -1 : key === 2 ? 2 ** 40 : key === 1 ? 0.5 : 0);
    expect(orderByColumns(rows, [column(rows, {specialClass})])).toEqual([3, 4, 1, 2]);
    expect(orderByColumns(rows, [column(rows, {specialClass, specialsFirst: true})])).toEqual([2, 1, 4, 3]);
    const big = Array.from({length: 200}, (_, i) => 200 - i);
    expect(orderByColumns(big, [column(big, {specialClass})]).slice(-3)).toEqual([4, 1, 2]);
  });

  it("survives thousands of identical rules", () => {
    const rows = Array.from({length: 129}, (_, i) => ({v: i % 3, i}));
    const rules = Array.from({length: 5000}, () => ({by: "v" as const}));
    expect(multisort(rows, rules).map((x) => x.i)).toEqual(lodashOrderBy(rows, ["v"]).map((x) => x.i));
  });
});

describe("scratch memory", () => {
  it("does not allocate a full-size pool per tie group past the retained pool size", () => {
    const n = (1 << 17) + 1;
    const rows = Array.from({length: n}, (_, id) => ({id, a: Math.floor(id / 32), b: (id * 17) % 32}));
    const Original = globalThis.Float64Array;
    let allocated = 0;
    class Counting extends Original {
      constructor(length: number) {
        super(length);
        allocated += length;
      }
    }
    globalThis.Float64Array = Counting as never;
    try {
      const out = orderBy(rows, ["a", "b"]);
      expect(distinct(out)).toBe(n);
    } finally {
      globalThis.Float64Array = Original;
    }
    expect(allocated).toBeLessThan(4 * n);
  });
});

describe("direct small-input path", () => {
  it("sorts undefined items by their keys like lodash", () => {
    const rows = [{x: 2}, undefined, {x: 1}, undefined];
    const get = (row: {x: number} | undefined) => row?.x ?? 0;
    expect(orderBy(rows, [get])).toEqual(lodashOrderBy(rows, [get]));
    expect(multisort(rows, [{by: get, order: "desc"}])).toEqual([{x: 2}, {x: 1}, undefined, undefined]);
  });

  it("agrees with the large path on every small input", () => {
    const key = fc.oneof(fc.integer({min: -2, max: 2}), fc.constantFrom<unknown>(null, undefined, "a", "b", NaN));
    fc.assert(
      fc.property(
        fc.array(fc.record({a: key, b: key}), {maxLength: 32}),
        fc.array(fc.constantFrom("asc" as const, "desc" as const), {maxLength: 2}),
        fc.array(fc.constantFrom<"first" | "last" | undefined>("first", "last", undefined), {maxLength: 2}),
        (items, orders, nulls) => {
          const rows = items.map((item, id) => ({...item, id}));
          const padded = rows.concat(Array.from({length: 40}, (_, i) => ({a: 99, b: 99, id: 1000 + i})));
          const ids = (xs: Array<{id: number}>) => xs.map((x) => x.id).filter((id) => id < 1000);
          expect(ids(orderBy(rows, ["a", "b"], orders))).toEqual(ids(orderBy(padded, ["a", "b"], orders)));
          const rules = [
            {by: "a" as const, order: orders[0], nulls: nulls[0]},
            {by: "b" as const, order: orders[1], nulls: nulls[1]},
          ];
          expect(ids(multisort(rows, rules))).toEqual(ids(multisort(padded, rules)));
        }
      ),
      {numRuns: 500}
    );
  });
});

describe("keys are read once per item", () => {
  it("calls each iteratee once per item on every path", () => {
    for (const n of [2, 10, 16, 17, 200]) {
      const items = Array.from({length: n}, (_, i) => i);
      let k = 0;
      const out = orderBy(items, [() => k++]);
      expect(k).toBe(n);
      expect(out).toEqual(lodashOrderBy(items, [((i: number) => i) as (i: number) => number]));
      let calls = 0;
      multisort(items, [{by: (i) => (calls++, -i)}, {by: (i) => (calls++, i)}]);
      expect(calls).toBe(2 * n);
    }
  });

  it("calls the iteratee once per item when the ordered-input check stops midway", () => {
    for (const n of [12, 17, 200]) {
      const items = Array.from({length: n}, (_, i) => i);
      const columns = [
        items.map((i) => (i === 0 ? null : i)),
        items.map((i) => (i === n >> 1 ? null : i)),
        items.map((i) => (i * 7919) % n),
        items.map((i) => Math.max(n - i, 2)),
      ];
      for (const keys of columns) {
        for (const order of ["asc", "desc"] as const) {
          let calls = 0;
          const out = orderBy(items, [(i) => (calls++, keys[i])], [order]);
          expect(calls).toBe(n);
          expect(out).toEqual(lodashOrderBy(items, [(i: number) => keys[i]], [order]));
        }
      }
    }
  });

  it("orders keys from an impure iteratee like lodash", () => {
    let k = 0;
    expect(orderBy([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], [() => k++])).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
});

describe("special keys are never compared by value", () => {
  it("sorts a mostly ascending column holding a symbol like lodash", () => {
    const rows = Array.from({length: 20}, (_, i) => ({id: i, a: i === 3 ? Symbol("s") : i}));
    expect(orderBy(rows, ["a"]).map((r) => r.id)).toEqual(lodashOrderBy(rows, ["a"]).map((r) => r.id));
    expect(multisort(rows, [{by: "a"}]).map((r) => r.id)).toHaveLength(20);
  });

  it("never converts a key marked special to a primitive", () => {
    const opaque = Object.create(null);
    const keys = Array.from({length: 40}, (_, i) => (i === 5 ? opaque : i));
    const specialClass = (key: unknown) => (key === opaque ? 1 : 0);
    expect(orderByColumns(keys, [column(keys, {specialClass})]).at(-1)).toBe(opaque);
  });
});

describe("reversed columns", () => {
  it("does not reverse a strictly descending column that later holds a non-number", () => {
    for (const n of [3, 20, 100]) {
      for (const tail of [undefined, null, "x", NaN]) {
        const rows = [...Array.from({length: n}, (_, i) => ({id: i, v: n - i})), {id: n, v: tail}];
        expect(orderBy(rows, ["v"]).map((r) => r.id)).toEqual(lodashOrderBy(rows, ["v"]).map((r) => r.id));
        expect(orderBy(rows, ["v"], ["desc"]).map((r) => r.id)).toEqual(lodashOrderBy(rows, ["v"], ["desc"]).map((r) => r.id));
      }
    }
  });
});
