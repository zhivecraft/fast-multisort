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
    name: `${words[(rand() * words.length) | 0]} ${i % 97}`,
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
const libraries = (rows, c) => {
  const keys = c.props.map(keyOf);
  return {
    "fast-multisort": () => orderBy(rows, keys, c.orders),
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
const results = [];
for (const size of [1_000, 10_000]) {
  const rows = makeRows(size);
  const reps = Math.max(5, Math.round(300_000 / size));
  for (const c of cases) {
    const entry = {size, name: c.name, libs: {}};
    for (const [name, run] of Object.entries(libraries(rows, c))) {
      entry.libs[name] = median(run, reps);
    }
    results.push(entry);
  }
}
globalThis.__results = results;
