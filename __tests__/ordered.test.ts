import fc from "fast-check";
import lodashOrderBy from "lodash/orderBy";
import {describe, expect, it} from "vitest";

import {orderBy} from "../src/index.ts";

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
