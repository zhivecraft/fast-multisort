import fc from "fast-check";
import {describe, expect, it} from "vitest";

import {orderByColumns, type SortColumn} from "../src/index.ts";

type Row = {
  index: number;
  name: string | null;
  effort: string | number | null;
  rank: number | null;
  created: string | null;
  range: {start: string | null; end: string | null} | null;
};

type Field = "name" | "effort" | "rank" | "created" | "start" | "end";
type Rule = {field: Field; desc: boolean; nullsFirst: boolean};

const decimalLiteral = fc
  .tuple(fc.boolean(), fc.nat(999), fc.option(fc.nat(99), {nil: undefined}))
  .map(([negative, int, frac]) => `${negative && (int > 0 || frac) ? "-" : ""}${int}${frac === undefined ? "" : `.${frac}`}`);

const isoDate = fc.integer({min: 0, max: 6}).map((d) => `2026-01-0${d + 1}T00:00:00.000Z`);

const rowArb = fc.record({
  name: fc.option(fc.constantFrom("", "a", "B", "b", "Alpha", "alpha", "zeta", "Zeta", "0", "10", "9"), {nil: null}),
  effort: fc.option(fc.oneof(decimalLiteral, fc.nat(999)), {nil: null}),
  rank: fc.option(fc.integer({min: -3, max: 3}), {nil: null}),
  created: fc.option(isoDate, {nil: null}),
  range: fc.option(fc.record({start: fc.option(isoDate, {nil: null}), end: fc.option(isoDate, {nil: null})}), {
    nil: null,
  }),
});

const ruleArb: fc.Arbitrary<Rule> = fc.record({
  field: fc.constantFrom<Field>("name", "effort", "rank", "created", "start", "end"),
  desc: fc.boolean(),
  nullsFirst: fc.boolean(),
});

const valueOf = (row: Row, field: Field): unknown => {
  if (field === "start" || field === "end") {
    return row.range === null ? null : row.range[field];
  }
  return row[field];
};

const toSortKey = (value: unknown, decimal: boolean): unknown => {
  if (typeof value === "number") {
    return decimal ? value.toString() : value;
  }
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  return typeof value === "string" && !decimal ? value.toLowerCase() : value;
};

const nullClass = (key: unknown) => (key === undefined ? 1 : 0);
const decimalCompare = (a: unknown, b: unknown) => Math.sign(Number(a) - Number(b));

const columnsOf = (rows: Row[], rules: Rule[]): SortColumn[] =>
  rules.map(({field, desc, nullsFirst}) => {
    const decimal = field === "effort";
    return {
      keys: rows.map((row) => toSortKey(valueOf(row, field), decimal)),
      desc,
      specialClass: nullClass,
      specialsFirst: nullsFirst,
      compare: decimal ? decimalCompare : undefined,
    };
  });

const hasValue = (v: unknown) => typeof v === "number" || (v !== null && v !== undefined && v !== "");

const specCompare = (a: Row, b: Row, rules: Rule[]) => {
  for (const {field, desc, nullsFirst} of rules) {
    const va = valueOf(a, field);
    const vb = valueOf(b, field);
    const aHas = hasValue(va);
    const bHas = hasValue(vb);
    if (!aHas && !bHas) {
      continue;
    }
    if (aHas !== bHas) {
      return aHas === nullsFirst ? 1 : -1;
    }
    let result: number;
    if (field === "effort") {
      result = Math.sign(Number(va) - Number(vb));
    } else {
      const fa = typeof va === "string" ? va.toLowerCase() : (va as number);
      const fb = typeof vb === "string" ? vb.toLowerCase() : (vb as number);
      result = fa > fb ? 1 : fa === fb ? 0 : -1;
    }
    if (result !== 0) {
      return desc ? -result : result;
    }
  }
  return 0;
};

const assertStableUnderSpec = (rows: Row[], rules: Rule[]) => {
  const ordered = orderByColumns(rows, columnsOf(rows, rules));
  expect(ordered).toHaveLength(rows.length);
  expect(new Set(ordered)).toEqual(new Set(rows));
  for (let i = 1; i < ordered.length; i++) {
    const cmp = specCompare(ordered[i - 1], ordered[i], rules);
    expect(cmp).toBeLessThanOrEqual(0);
    if (cmp === 0) {
      expect(ordered[i - 1].index).toBeLessThan(ordered[i].index);
    }
  }
};

describe("orderByColumns under the record-sort specification", () => {
  it("is a stable sort on small inputs", () => {
    fc.assert(
      fc.property(fc.array(rowArb, {maxLength: 40}), fc.array(ruleArb, {maxLength: 3}), (items, rules) => {
        assertStableUnderSpec(
          items.map((item, index) => ({...item, index})),
          rules
        );
      }),
      {numRuns: 500}
    );
  });

  it("is a stable sort across every path threshold", () => {
    fc.assert(
      fc.property(
        fc.array(rowArb, {minLength: 100, maxLength: 400}),
        fc.array(ruleArb, {minLength: 1, maxLength: 3}),
        (items, rules) => {
          assertStableUnderSpec(
            items.map((item, index) => ({...item, index})),
            rules
          );
        }
      ),
      {numRuns: 150}
    );
  });
});

const perturbed = <T>(sorted: T[], moves: Array<[number, number]>) => {
  const rows = sorted.slice();
  for (const [from, to] of moves) {
    const [row] = rows.splice(from % rows.length, 1);
    rows.splice(to % (rows.length + 1), 0, row);
  }
  return rows;
};

describe("orderByColumns on nearly ordered inputs", () => {
  it("is a stable sort when a few rows moved out of an ordered list", () => {
    fc.assert(
      fc.property(
        fc.array(rowArb, {minLength: 20, maxLength: 400}),
        fc.array(ruleArb, {minLength: 1, maxLength: 3}),
        fc.array(fc.tuple(fc.nat(), fc.nat()), {maxLength: 12}),
        (items, rules, moves) => {
          const sorted = items.map((item, index) => ({...item, index})).toSorted((a, b) => specCompare(a, b, rules));
          assertStableUnderSpec(
            perturbed(sorted, moves).map((item, index) => ({...item, index})),
            rules
          );
        }
      ),
      {numRuns: 400}
    );
  });
});
