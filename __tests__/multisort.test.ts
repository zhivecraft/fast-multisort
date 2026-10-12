import fc from "fast-check";
import {describe, expect, it} from "vitest";

import {multisort, orderBy} from "../src/index.ts";

type Row = {id: number; name: string | null; rank: number | null | undefined};

const rows: Row[] = [
  {id: 0, name: "b", rank: 2},
  {id: 1, name: null, rank: 1},
  {id: 2, name: "a", rank: null},
  {id: 3, name: "b", rank: undefined},
  {id: 4, name: "a", rank: 3},
  {id: 5, name: null, rank: null},
];

const ids = (sorted: Row[]) => sorted.map((row) => row.id);

describe("multisort", () => {
  it("defaults to lodash placement, nulls last ascending and first descending, but null equals undefined", () => {
    expect(ids(multisort(rows, [{by: "name"}]))).toEqual(ids(orderBy(rows, ["name"])));
    expect(ids(multisort(rows, [{by: "rank", order: "desc"}]))).toEqual([2, 3, 5, 4, 0, 1]);
    expect(ids(orderBy(rows, ["rank"], ["desc"]))).toEqual([3, 2, 5, 4, 0, 1]);
  });

  it("places nulls first or last independently of direction", () => {
    expect(ids(multisort(rows, [{by: "name", nulls: "first"}]))).toEqual([1, 5, 2, 4, 0, 3]);
    expect(ids(multisort(rows, [{by: "name", order: "desc", nulls: "last"}]))).toEqual([0, 3, 2, 4, 1, 5]);
    expect(ids(multisort(rows, [{by: (row) => row.rank, nulls: "first"}]))).toEqual([2, 3, 5, 1, 0, 4]);
    expect(ids(multisort(rows, [{by: (row) => row.rank, order: "desc", nulls: "last"}]))).toEqual([4, 0, 1, 2, 3, 5]);
  });

  it("treats null and undefined as the same null and keeps their input order", () => {
    expect(ids(multisort(rows, [{by: "rank", nulls: "first"}]))).toEqual([2, 3, 5, 1, 0, 4]);
  });

  it("breaks ties with the next rule, nulls placement per rule", () => {
    expect(ids(multisort(rows, [{by: "name", nulls: "last"}, {by: "rank", order: "desc", nulls: "first"}]))).toEqual([
      2, 4, 3, 0, 5, 1,
    ]);
  });

  it("agrees with a reference comparator on random data", () => {
    const rowArb = fc.record({
      id: fc.nat(),
      name: fc.option(fc.constantFrom("a", "b", "c", ""), {nil: null}),
      rank: fc.option(fc.integer({min: -3, max: 3}), {nil: null}),
    });
    const ruleArb = fc.record({
      by: fc.constantFrom<"name" | "rank">("name", "rank"),
      order: fc.constantFrom<"asc" | "desc">("asc", "desc"),
      nulls: fc.constantFrom<"first" | "last">("first", "last"),
    });
    const reference = (items: Row[], rules: Array<{by: "name" | "rank"; order: "asc" | "desc"; nulls: "first" | "last"}>) =>
      items
        .map((item, index) => ({item, index}))
        .sort((a, b) => {
          for (const {by, order, nulls} of rules) {
            const x = a.item[by];
            const y = b.item[by];
            const xNull = x === null || x === undefined;
            const yNull = y === null || y === undefined;
            if (xNull !== yNull) {
              return xNull === (nulls === "first") ? -1 : 1;
            }
            if (!xNull && x !== y) {
              const result = (x as number | string) < (y as number | string) ? -1 : 1;
              return order === "desc" ? -result : result;
            }
          }
          return a.index - b.index;
        })
        .map(({item}) => item);
    fc.assert(
      fc.property(fc.array(rowArb, {maxLength: 60}), fc.array(ruleArb, {minLength: 1, maxLength: 3}), (items, rules) => {
        const indexed = items.map((row, id) => ({...row, id}));
        expect(ids(multisort(indexed, rules))).toEqual(ids(reference(indexed, rules)));
      }),
      {numRuns: 500}
    );
  });
});
