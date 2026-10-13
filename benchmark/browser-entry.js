import {orderBy as esToolkitOrderBy} from "es-toolkit";
import {sort as fastSort} from "fast-sort";
import lodashOrderBy from "lodash/orderBy.js";
import {ascend, descend, sortWith} from "ramda";
import {sortBy as remedaSortBy} from "remeda";
import sortArray from "sort-array";
import {firstBy} from "thenby";

import {orderBy} from "../dist/index.mjs";

let seed = 7;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const words = ["Alpha", "beta", "Gamma", "delta", "Epsilon", "zeta", "Eta", "theta", "Iota", "kappa"];
const makeRows = (n) =>
  Array.from({length: n}, (_, i) => ({
    name: words[(rand() * words.length) | 0],
    unique: `${words[(rand() * words.length) | 0]}-${((rand() * 1e9) | 0).toString(36)}-${i}`,
    rank: rand() < 0.1 ? null : (rand() * 1e9) | 0,
    weight: rand(),
    created: new Date(1.7e12 + rand() * 1e10).toISOString(),
    sorted: i,
  }));
const keyOf = (prop) => (x) => x[prop];
const cases = [
  {name: "string key, 10 distinct values", props: ["name"], orders: ["asc"]},
  {name: "string key, all unique", props: ["unique"], orders: ["asc"]},
  {name: "integer key, 10% null", props: ["rank"], orders: ["asc"]},
  {name: "float key", props: ["weight"], orders: ["asc"]},
  {name: "ISO date string key", props: ["created"], orders: ["asc"]},
  {name: "already sorted integer key", props: ["sorted"], orders: ["asc"]},
  {name: "three keys, mixed directions", props: ["name", "rank", "created"], orders: ["asc", "desc", "asc"]},
];

const str = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const rankAsc = (a, b) => (a === b ? 0 : a === null ? 1 : b === null ? -1 : a - b);
const rankDesc = (a, b) => (a === b ? 0 : a === null ? -1 : b === null ? 1 : b - a);
const inlineChains = {
  "string key, 10 distinct values": (a, b) => str(a.name, b.name),
  "string key, all unique": (a, b) => str(a.unique, b.unique),
  "integer key, 10% null": (a, b) => rankAsc(a.rank, b.rank),
  "float key": (a, b) => a.weight - b.weight,
  "ISO date string key": (a, b) => str(a.created, b.created),
  "already sorted integer key": (a, b) => a.sorted - b.sorted,
  "reverse sorted integer key": (a, b) => a.reversed - b.reversed,
  "three keys, mixed directions": (a, b) => str(a.name, b.name) || rankDesc(a.rank, b.rank) || str(a.created, b.created),
};
const libraries = (rows, c) => {
  const keys = c.props.map(keyOf);
  return {
    "fast-multisort": () => orderBy(rows, keys, c.orders),
    "inline comparator chain, slice().sort()": () => rows.slice().sort(inlineChains[c.name]),
    "inline comparator chain, toSorted()": () => rows.toSorted(inlineChains[c.name]),
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
  };
};
const median = (fn, reps) => {
  for (let i = 0; i < 10; i++) {
    fn();
  }
  const samples = [];
  for (let r = 0; r < 7; r++) {
    const start = performance.now();
    for (let i = 0; i < reps; i++) {
      fn();
    }
    samples.push((performance.now() - start) / reps);
  }
  samples.sort((a, b) => a - b);
  return samples[3];
};
const permutation = (sorted, rows) => {
  const at = new Map(rows.map((row, i) => [row, i]));
  return sorted.map((x) => at.get(x)).join(",");
};
const results = [];
for (const size of [1, 10, 100, 1_000, 10_000, 100_000]) {
  const rows = makeRows(size);
  const reps = Math.max(3, Math.round(300_000 / size));
  for (const c of cases) {
    const entry = {size, name: c.name, libs: {}, different: []};
    const reference = permutation(lodashOrderBy(rows, c.props.map(keyOf), c.orders), rows);
    for (const [name, run] of Object.entries(libraries(rows, c))) {
      if (permutation(run(), rows) !== reference) {
        if (name === "fast-multisort") {
          throw new Error(`fast-multisort returned a different order on ${size} rows, ${c.name}`);
        }
        entry.different.push(name);
      }
      entry.libs[name] = median(run, reps);
    }
    results.push(entry);
  }
}
globalThis.__results = results;
