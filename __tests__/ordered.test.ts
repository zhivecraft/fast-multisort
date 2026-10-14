import fc from "fast-check";
import lodashOrderBy from "lodash/orderBy";
import {describe, expect, it} from "vitest";

import {multisort, orderBy} from "../src/index.ts";

const ids = <T extends {i: number}>(items: T[]) => items.map((x) => x.i);

describe("already ordered inputs", () => {
  it("keeps equal keys in input order when the column is already in order", () => {
    const items = [1, 1, 2, 2].map((v, i) => ({v, i}));
    expect(ids(orderBy(items, ["v"]))).toEqual([0, 1, 2, 3]);
    expect(ids(orderBy(items, ["v"], ["desc"]))).toEqual([2, 3, 0, 1]);
    const flat = [1, 1].map((v, i) => ({v, i}));
    expect(ids(orderBy(flat, ["v"], ["desc"]))).toEqual([0, 1]);
  });

  it("reverses strictly monotonic columns and leaves the rest to the sorter", () => {
    const up = [1, 2, 3, 4].map((v, i) => ({v, i}));
    expect(ids(orderBy(up, ["v"], ["desc"]))).toEqual([3, 2, 1, 0]);
    const down = ["d", "c", "b", "a"].map((v, i) => ({v, i}));
    expect(ids(orderBy(down, ["v"]))).toEqual([3, 2, 1, 0]);
  });

  it("matches lodash on monotonic and near-monotonic columns of any size", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({min: 0, max: 5}), {minLength: 1, maxLength: 400}),
        fc.boolean(),
        fc.boolean(),
        (values, sorted, desc) => {
          const keys = sorted ? [...values].sort((a, b) => a - b) : values;
          const items = keys.map((v, i) => ({v, i}));
          const orders: Array<"asc" | "desc"> = [desc ? "desc" : "asc"];
          expect(ids(orderBy(items, ["v"], orders))).toEqual(ids(lodashOrderBy(items, ["v"], orders)));
        }
      ),
      {numRuns: 300}
    );
  });
});

describe("nearly ordered inputs", () => {
  it("match lodash when a few rows moved, any keys, directions and nulls", () => {
    const key = fc.oneof(fc.integer({min: -50, max: 50}), fc.constantFrom<unknown>(null, undefined, "a", "b"));
    fc.assert(
      fc.property(
        fc.array(fc.record({a: key, b: key}), {minLength: 20, maxLength: 400}),
        fc.array(fc.constantFrom("asc" as const, "desc" as const), {minLength: 1, maxLength: 2}),
        fc.array(fc.tuple(fc.nat(), fc.nat()), {maxLength: 12}),
        (values, orders, moves) => {
          const props = orders.length === 1 ? ["a"] : ["a", "b"];
          const rows = lodashOrderBy(values, props, orders);
          for (const [from, to] of moves) {
            const [row] = rows.splice(from % rows.length, 1);
            rows.splice(to % (rows.length + 1), 0, row);
          }
          const items = rows.map((row, i) => ({...row, i}));
          expect(ids(orderBy(items, props as Array<"a" | "b">, orders))).toEqual(ids(lodashOrderBy(items, props, orders)));
        }
      ),
      {numRuns: 400}
    );
  });

  it("match lodash when a few rows of one number or string column moved, past the run threshold", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.array(fc.integer({min: -50, max: 50}), {minLength: 64, maxLength: 2000}),
          fc.array(fc.constantFrom("a", "b", "c", "d"), {minLength: 64, maxLength: 2000})
        ),
        fc.constantFrom("asc" as const, "desc" as const),
        fc.array(fc.tuple(fc.nat(), fc.nat()), {minLength: 1, maxLength: 4}),
        (values, order, moves) => {
          const rows = lodashOrderBy(
            values.map((a) => ({a})),
            ["a"],
            [order]
          );
          for (const [from, to] of moves) {
            const [row] = rows.splice(from % rows.length, 1);
            rows.splice(to % (rows.length + 1), 0, row);
          }
          const items = rows.map((row, i) => ({...row, i}));
          const expected = ids(lodashOrderBy(items, ["a"], [order]));
          expect(ids(orderBy(items, ["a"], [order]))).toEqual(expected);
          expect(ids(multisort(items, [{by: "a", order}]))).toEqual(expected);
        }
      ),
      {numRuns: 300}
    );
  });
});
