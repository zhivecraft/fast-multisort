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
import {Bench} from "tinybench";
import underscore from "underscore";

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
    reversed: n - i,
  }));

const keyOf = (prop) => (x) => x[prop];
const str = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const nullsLast = (a, b) => (a === b ? 0 : a === null ? 1 : b === null ? -1 : a - b);
const nullsFirstDesc = (a, b) => (a === b ? 0 : a === null ? -1 : b === null ? 1 : b - a);

export const cases = [
  {name: "string key, 10 distinct values", props: ["name"], orders: ["asc"], inline: (a, b) => str(a.name, b.name)},
  {name: "string key, all unique", props: ["unique"], orders: ["asc"], inline: (a, b) => str(a.unique, b.unique)},
  {name: "integer key, 10% null", props: ["rank"], orders: ["asc"], inline: (a, b) => nullsLast(a.rank, b.rank)},
  {name: "float key", props: ["weight"], orders: ["asc"], inline: (a, b) => a.weight - b.weight},
  {name: "ISO date string key", props: ["created"], orders: ["asc"], inline: (a, b) => str(a.created, b.created)},
  {name: "already sorted integer key", props: ["sorted"], orders: ["asc"], inline: (a, b) => a.sorted - b.sorted},
  {name: "reverse sorted integer key", props: ["reversed"], orders: ["asc"], inline: (a, b) => a.reversed - b.reversed},
  {
    name: "three keys, mixed directions",
    props: ["name", "rank", "created"],
    orders: ["asc", "desc", "asc"],
    inline: (a, b) => str(a.name, b.name) || nullsFirstDesc(a.rank, b.rank) || str(a.created, b.created),
  },
];

export const sizes = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000];

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

const libraries = (rows, c) => {
  const keys = c.props.map(keyOf);
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

const permutation = (sorted, rows) => {
  const at = new Map(rows.map((row, i) => [row, i]));
  return sorted.map((x) => at.get(x)).join(",");
};

export const run = async (onCase = () => {}, only = sizes) => {
  const results = [];
  for (const size of only) {
    const rows = makeRows(size);
    for (const c of cases) {
      const bench = new Bench({time: 500, warmupTime: 100});
      const reference = permutation(lodashOrderBy(rows, c.props.map(keyOf), c.orders), rows);
      for (const [name, fn] of Object.entries(libraries(rows, c))) {
        let status = "";
        try {
          if (permutation(fn(), rows) !== reference) {
            status = " (different order)";
          }
        } catch (error) {
          status = ` (threw: ${error.message})`;
        }
        if (name === "fast-multisort" && status !== "") {
          throw new Error(`fast-multisort${status} on ${size} rows, ${c.name}`);
        }
        bench.add(`${name}${status}`, fn);
      }
      await bench.run();
      const tasks = [...bench.tasks].sort((a, b) => (b.result?.throughput.mean ?? 0) - (a.result?.throughput.mean ?? 0));
      const ours = tasks.find((t) => t.name.startsWith("fast-multisort"))?.result?.throughput.mean ?? 0;
      const entry = {
        size,
        name: c.name,
        tasks: tasks.map((t) => ({
          name: t.name,
          ops: t.result?.throughput.mean ?? 0,
          ms: t.result?.latency.mean ?? 0,
          ratio: ours / (t.result?.throughput.mean ?? 1),
        })),
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
