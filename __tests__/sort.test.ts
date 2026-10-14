import fc from "fast-check";
import lodashOrderBy from "lodash/orderBy";
import lodashSortBy from "lodash/sortBy";
import {describe, expect, it} from "vitest";

import {orderBy, orderByColumns, sortBy} from "../src/index.ts";

type Item = {a: unknown; b: unknown; c: number};
type Iteratee = keyof Item | ((x: Item) => unknown);

const pools = {
  numbers: fc.oneof(
    fc.integer({min: -3, max: 3}),
    fc.constantFrom(-0, 0, 0.5, Infinity, -Infinity, 1e21, null, undefined)
  ),
  strings: fc.constantFrom("", "a", "B", "b", "10", "9", "é", null, undefined),
  booleans: fc.constantFrom(true, false, null, undefined),
  dates: fc.constantFrom(new Date(0), new Date(0), new Date(1), null, undefined),
  chaos: fc.constantFrom<unknown>(NaN, 0, 1, "1", "a", true, false, null, undefined, Symbol.for("s"), new Date(0), {}),
};

const itemsOf = (key: fc.Arbitrary<unknown>) => fc.array(fc.record({a: key, b: key, c: fc.nat()}), {maxLength: 40});

const iterateesArb = fc.constantFrom<Iteratee[]>(
  ["a"],
  ["b"],
  ["a", "b"],
  [(x) => x.b, "a"],
  [(x) => x.c % 3, (x) => x.a],
  [(x) => x.c % 3, (x) => x.a, (x) => x.b],
  []
);
const ordersArb = fc.array(fc.constantFrom("asc" as const, "desc" as const), {maxLength: 3});

const indexed = (items: Item[]) => items.map((item, i) => ({...item, i}));

describe("sortBy / orderBy", () => {
  for (const [name, key] of Object.entries(pools)) {
    it(`sortBy orders ${name} like lodash`, () => {
      fc.assert(
        fc.property(itemsOf(key), iterateesArb, (items, iteratees) => {
          const input = indexed(items);
          expect(sortBy(input, ...iteratees).map((x) => x.i)).toEqual(lodashSortBy(input, iteratees).map((x) => x.i));
        }),
        {numRuns: 500}
      );
    });

    it(`orderBy orders ${name} like lodash`, () => {
      fc.assert(
        fc.property(itemsOf(key), iterateesArb, ordersArb, (items, iteratees, orders) => {
          const input = indexed(items);
          expect(orderBy(input, iteratees, orders).map((x) => x.i)).toEqual(
            lodashOrderBy(input, iteratees, orders).map((x) => x.i)
          );
        }),
        {numRuns: 500}
      );
    });
  }

  it("orders a heterogeneous single column exactly like lodash", () => {
    const key = fc.constantFrom<unknown>(0, 1, "1", "a", true, null, undefined, Symbol.for("s"), new Date(0), {});
    fc.assert(
      fc.property(itemsOf(key), fc.constantFrom("asc" as const, "desc" as const), (items, order) => {
        const input = indexed(items);
        expect(orderBy(input, ["a"], [order]).map((x) => x.i)).toEqual(
          lodashOrderBy(input, ["a"], [order]).map((x) => x.i)
        );
      }),
      {numRuns: 500}
    );
  });

  it("orders a column of dates and plain objects exactly like lodash", () => {
    const key = fc.constantFrom<unknown>(new Date(0), new Date(1), new Date(2), {}, {});
    fc.assert(
      fc.property(fc.array(key, {minLength: 2, maxLength: 16}), fc.constantFrom("asc" as const, "desc" as const), (keys, order) => {
        const input = keys.map((a, i) => ({a, i}));
        expect(orderBy(input, ["a"], [order]).map((x) => x.i)).toEqual(
          lodashOrderBy(input, ["a"], [order]).map((x) => x.i)
        );
      }),
      {numRuns: 500}
    );
  });

  it("orders NaN as the greatest key exactly like lodash, including its unstable NaN ties", () => {
    const items = [
      {v: NaN, i: 0},
      {v: undefined, i: 1},
      {v: 2, i: 2},
      {v: NaN, i: 3},
      {v: null, i: 4},
    ];
    expect(sortBy(items, "v").map((x) => x.i)).toEqual([2, 4, 1, 0, 3]);
    expect(orderBy(items, ["v"], ["desc"]).map((x) => x.i)).toEqual([3, 0, 1, 4, 2]);
  });

  it("keeps special placement on the comparator fallback for heterogeneous columns", () => {
    const items = [
      {v: "8", d: undefined, i: 0},
      {v: 8, d: "b", i: 1},
      {v: 8, d: undefined, i: 2},
      {v: "8", d: "a", i: 3},
    ];
    const nullClass = (key: unknown) => (key === undefined ? 1 : 0);
    const column = (keys: unknown[], desc: boolean, specialsFirst: boolean) => ({
      keys,
      desc,
      specialClass: nullClass,
      specialsFirst,
    });
    const byValueThenDate = (desc: boolean, specialsFirst: boolean) =>
      orderByColumns(items, [
        column(
          items.map((x) => x.v),
          false,
          false
        ),
        column(
          items.map((x) => x.d),
          desc,
          specialsFirst
        ),
      ]).map((x) => x.i);
    expect(
      orderByColumns(items, [
        column(
          items.map((x) => x.v),
          false,
          false
        ),
      ]).map((x) => x.i)
    ).toEqual([0, 1, 2, 3]);
    expect(byValueThenDate(false, false)).toEqual([3, 1, 0, 2]);
    expect(byValueThenDate(true, false)).toEqual([1, 3, 0, 2]);
    expect(byValueThenDate(false, true)).toEqual([0, 2, 3, 1]);
    expect(byValueThenDate(true, true)).toEqual([0, 2, 1, 3]);
  });

  it("keeps ties in input order on small inputs bucketed by a string column", () => {
    const word = fc.integer({min: 0, max: 30}).map((k) => `k${k}`);
    fc.assert(
      fc.property(
        fc.uniqueArray(word, {minLength: 16, maxLength: 16}),
        fc.array(word, {minLength: 1, maxLength: 112}),
        fc.array(fc.integer({min: 0, max: 2}), {minLength: 128, maxLength: 128}),
        ordersArb,
        (head, tail, seconds, orders) => {
          const input = [...head, ...tail].map((a, i) => ({a, b: seconds[i], i}));
          for (const props of [["a"], ["a", "b"]] as const) {
            expect(orderBy(input, props, orders).map((x) => x.i)).toEqual(
              lodashOrderBy(input, props, orders).map((x) => x.i)
            );
          }
        }
      ),
      {numRuns: 300}
    );
  });

  it("sorts large numeric columns via radix identically to a comparator sort", () => {
    fc.assert(
      fc.property(fc.array(fc.double({noNaN: true}), {minLength: 64, maxLength: 300}), (values) => {
        const input = values.map((v, i) => ({v, i}));
        const expected = input.slice().sort((x, y) => (x.v === y.v ? x.i - y.i : x.v < y.v ? -1 : 1));
        expect(sortBy(input, "v")).toEqual(expected);
      }),
      {numRuns: 200}
    );
  });
});
