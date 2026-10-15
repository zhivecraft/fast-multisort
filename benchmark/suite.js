import {orderBy as esToolkitOrderBy} from "es-toolkit";
import {sort as fastSort} from "fast-sort";
import justSortBy from "just-sort-by";
import lodashOrderBy from "lodash/orderBy.js";
import {orderBy as naturalOrderBy} from "natural-orderby";
import {ascend, descend, sortWith} from "ramda";
import {sortBy as remedaSortBy} from "remeda";
import sortArray from "sort-array";
import sortByPath from "sort-by";
import sortOn from "sort-on";
import {firstBy} from "thenby";
import underscore from "underscore";

import {orderBy} from "../dist/index.mjs";

let seed = 7;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const words = ["Alpha", "beta", "Gamma", "delta", "Epsilon", "zeta", "Eta", "theta", "Iota", "kappa"];
export const makeRows = (n) =>
  Array.from({length: n}, (_, i) => ({
    name: words[(rand() * words.length) | 0],
    unique: `${words[(rand() * words.length) | 0]}-${((rand() * 1e9) | 0).toString(36)}-${i}`,
    rank: rand() < 0.1 ? null : (rand() * 1e9) | 0,
    weight: rand(),
    created: new Date(1.7e12 + rand() * 1e10).toISOString(),
    sorted: i,
    reversed: n - i,
    moved: i === ((n * 0.37) | 0) ? ((n * 0.83) | 0) + 0.5 : i,
  }));

const str = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const nullsLast = (a, b) => (a === b ? 0 : a === null ? 1 : b === null ? -1 : a - b);
const nullsFirstDesc = (a, b) => (a === b ? 0 : a === null ? -1 : b === null ? 1 : b - a);

export const cases = [
  {name: "string key, 10 distinct values", props: ["name"], getters: [(x) => x.name], orders: ["asc"], inline: (a, b) => str(a.name, b.name)},
  {name: "string key, all unique", props: ["unique"], getters: [(x) => x.unique], orders: ["asc"], inline: (a, b) => str(a.unique, b.unique)},
  {name: "integer key, 10% null", props: ["rank"], getters: [(x) => x.rank], orders: ["asc"], inline: (a, b) => nullsLast(a.rank, b.rank)},
  {name: "float key", props: ["weight"], getters: [(x) => x.weight], orders: ["asc"], inline: (a, b) => a.weight - b.weight},
  {name: "ISO date string key", props: ["created"], getters: [(x) => x.created], orders: ["asc"], inline: (a, b) => str(a.created, b.created)},
  {name: "already sorted integer key", props: ["sorted"], getters: [(x) => x.sorted], orders: ["asc"], inline: (a, b) => a.sorted - b.sorted},
  {name: "reverse sorted integer key", props: ["reversed"], getters: [(x) => x.reversed], orders: ["asc"], inline: (a, b) => a.reversed - b.reversed},
  {name: "ordered list, one row moved", props: ["moved"], getters: [(x) => x.moved], orders: ["asc"], inline: (a, b) => a.moved - b.moved},
  {
    name: "three keys, mixed directions",
    props: ["name", "rank", "created"],
    getters: [(x) => x.name, (x) => x.rank, (x) => x.created],
    orders: ["asc", "desc", "asc"],
    inline: (a, b) => str(a.name, b.name) || nullsFirstDesc(a.rank, b.rank) || str(a.created, b.created),
  },
];

export const sizes = [1, 10, 100, 1_000, 10_000, 100_000];

const compareNullsLast = (a, b) => (a === b ? 0 : a == null ? 1 : b == null ? -1 : a < b ? -1 : 1);
const nativeDecorated = (items, props, orders) =>
  items
    .map((item, index) => ({item, index}))
    .sort((a, b) => {
      for (let i = 0; i < props.length; i++) {
        const result = compareNullsLast(a.item[props[i]], b.item[props[i]]);
        if (result !== 0) {
          return orders[i] === "desc" ? -result : result;
        }
      }
      return a.index - b.index;
    })
    .map((x) => x.item);

export const libraries = (rows, c) => {
  const keys = c.getters;
  const signed = c.props.map((p, i) => (c.orders[i] === "desc" ? `-${p}` : p));
  const list = {
    "fast-multisort": () => orderBy(rows, keys, c.orders),
    "inline comparator chain, slice().sort()": () => rows.slice().sort(c.inline),
    "inline comparator chain, toSorted()": () => rows.toSorted(c.inline),
    "lodash.orderBy": () => lodashOrderBy(rows, keys, c.orders),
    "es-toolkit.orderBy": () => esToolkitOrderBy(rows, keys, c.orders),
    "remeda.sortBy": () => remedaSortBy(rows, ...keys.map((key, i) => [key, c.orders[i]])),
    "ramda.sortWith": () => sortWith(keys.map((key, i) => (c.orders[i] === "desc" ? descend(key) : ascend(key))), rows),
    "fast-sort": () => fastSort(rows).by(keys.map((key, i) => ({[c.orders[i]]: key}))),
    "sort-array": () => sortArray([...rows], {by: c.props, order: c.orders}),
    thenby: () => {
      let cmp = firstBy(keys[0], c.orders[0] === "desc" ? -1 : 1);
      for (let i = 1; i < keys.length; i++) {
        cmp = cmp.thenBy(keys[i], c.orders[i] === "desc" ? -1 : 1);
      }
      return rows.slice().sort(cmp);
    },
    "sort-on": () => sortOn(rows, signed),
    "sort-by": () => rows.slice().sort(sortByPath(...signed)),
    "natural-orderby": () => naturalOrderBy(rows, keys, c.orders),
    "Array.prototype.sort, decorated": () => nativeDecorated(rows, c.props, c.orders),
  };
  if (c.props.length === 1 && c.orders[0] === "asc") {
    list["underscore.sortBy"] = () => underscore.sortBy(rows, keys[0]);
    list["just-sort-by"] = () => justSortBy(rows, keys[0]);
  }
  return list;
};

let keep;

const batch = (fn, reps) => {
  const start = performance.now();
  for (let i = 0; i < reps; i++) {
    keep = fn();
  }
  return (performance.now() - start) / reps;
};

const ONE_CALL = 2000;

const calibrated = ({fn, first}) => {
  if (first >= ONE_CALL) {
    return {fn, reps: 1, samples: [first], rounds: 1};
  }
  for (let reps = 1; ; reps *= 2) {
    const ms = batch(fn, reps);
    if (ms * reps >= 20 || reps >= 1e7) {
      return {fn, reps, samples: [ms], rounds: ms * reps >= 500 ? 2 : 5};
    }
  }
};

export const measure = (entries) => {
  const tasks = entries.map(calibrated);
  const deadline = performance.now() + 500 * tasks.length;
  for (;;) {
    const due = tasks.filter((t) => t.samples.length < t.rounds || (t.rounds === 5 && t.samples.length < 25 && performance.now() < deadline));
    if (due.length === 0) {
      break;
    }
    for (const t of due) {
      t.samples.push(batch(t.fn, t.reps));
    }
  }
  globalThis.__keep = keep;
  return tasks.map((t) => t.samples.sort((a, b) => a - b)[t.samples.length >> 1]);
};

const permutation = (sorted, rows) => {
  const at = new Map(rows.map((row, i) => [row, i]));
  return sorted.map((x) => at.get(x)).join(",");
};

export const run = async (onCase = () => {}, only = sizes) => {
  const results = [];
  for (const size of only) {
    const rows = makeRows(size);
    for (const c of cases) {
      const reference = permutation(lodashOrderBy(rows, c.getters, c.orders), rows);
      const checked = Object.entries(libraries(rows, c)).map(([name, fn]) => {
        let status = "";
        let first = 0;
        try {
          const start = performance.now();
          const sorted = fn();
          first = performance.now() - start;
          if (permutation(sorted, rows) !== reference) {
            status = " (different order)";
          }
        } catch (error) {
          status = ` (threw: ${error.message})`;
        }
        if (name === "fast-multisort" && status !== "") {
          throw new Error(`fast-multisort${status} on ${size} rows, ${c.name}`);
        }
        return {name: `${name}${status}`, fn, first};
      });
      const ms = measure(checked);
      const timed = checked.map((t, i) => ({name: t.name, ms: ms[i]}));
      timed.sort((a, b) => a.ms - b.ms);
      const ours = timed.find((t) => t.name === "fast-multisort").ms;
      const entry = {
        size,
        name: c.name,
        tasks: timed.map((t) => ({name: t.name, ops: 1000 / t.ms, ms: t.ms, ratio: t.ms / ours})),
      };
      results.push(entry);
      onCase(entry);
      await new Promise((resolve) => setTimeout(resolve));
    }
  }
  return results;
};

export const markdown = ({size, name, tasks}) =>
  [
    `\n#### ${size.toLocaleString("en-US")} rows, ${name}\n`,
    "| library | ops/sec | mean ms | vs fast-multisort |",
    "|---|---:|---:|---:|",
    ...tasks.map((t) => `| ${t.name} | ${t.ops.toFixed(0)} | ${t.ms.toFixed(3)} | ${t.ratio.toFixed(2)}× |`),
  ].join("\n");
