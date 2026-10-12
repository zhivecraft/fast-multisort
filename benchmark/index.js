import os from "node:os";
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
import Table from "cli-table3";
import {Bench} from "tinybench";

import {orderBy} from "../dist/index.mjs";

const args = new Set(process.argv.slice(2));
const quick = args.has("--quick");
const markdown = args.has("--markdown");

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
    reversed: n - i,
  }));

const keyOf = (prop) => (x) => x[prop];

const compareNullsLast = (a, b) => {
  if (a === b) {
    return 0;
  }
  if (a === null || a === undefined) {
    return 1;
  }
  if (b === null || b === undefined) {
    return -1;
  }
  return a < b ? -1 : 1;
};
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

const cases = [
  {name: "string key, 10 distinct values", props: ["name"], orders: ["asc"]},
  {name: "string key, all unique", props: ["unique"], orders: ["asc"]},
  {name: "integer key, 10% null", props: ["rank"], orders: ["asc"]},
  {name: "float key", props: ["weight"], orders: ["asc"]},
  {name: "ISO date string key", props: ["created"], orders: ["asc"]},
  {name: "already sorted integer key", props: ["sorted"], orders: ["asc"]},
  {name: "reverse sorted integer key", props: ["reversed"], orders: ["asc"]},
  {name: "three keys, mixed directions", props: ["name", "rank", "created"], orders: ["asc", "desc", "asc"]},
];

const multi = (c) => c.props.length > 1;
const anyDesc = (c) => c.orders.includes("desc");

const libraries = (rows, c) => {
  const keys = c.props.map(keyOf);
  const signed = c.props.map((p, i) => (c.orders[i] === "desc" ? `-${p}` : p));
  const list = {
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
    "sort-on": () => sortOn(rows, signed),
    "sort-by": () => rows.slice().sort(sortByPath(...signed)),
    "natural-orderby": () => naturalOrderBy(rows, keys, c.orders),
    "Array.prototype.sort, decorated": () => nativeDecorated(rows, c.props, c.orders),
  };
  if (!multi(c) && !anyDesc(c)) {
    list["underscore.sortBy"] = () => underscore.sortBy(rows, keys[0]);
    list["just-sort-by"] = () => justSortBy(rows, keys[0]);
  }
  return list;
};

const permutation = (sorted, rows) => sorted.map((x) => rows.indexOf(x)).join(",");

const sizes = quick ? [10_000] : [100, 1_000, 10_000, 100_000];
const results = [];
for (const size of sizes) {
  const rows = makeRows(size);
  for (const c of cases) {
    if (size === 100_000 && !["string key, 10 distinct values", "three keys, mixed directions", "integer key, 10% null"].includes(c.name)) {
      continue;
    }
    const bench = new Bench({time: quick ? 200 : 500, warmupTime: 100});
    const reference = permutation(lodashOrderBy(rows, c.props.map(keyOf), c.orders), rows);
    for (const [name, run] of Object.entries(libraries(rows, c))) {
      let status = "";
      try {
        if (permutation(run(), rows) !== reference) {
          status = " (different order)";
        }
      } catch (error) {
        status = ` (threw: ${error.message})`;
      }
      bench.add(`${name}${status}`, run);
    }
    await bench.run();
    const tasks = [...bench.tasks].sort((a, b) => (b.result?.throughput.mean ?? 0) - (a.result?.throughput.mean ?? 0));
    const ours = tasks.find((t) => t.name.startsWith("fast-multisort"))?.result?.throughput.mean ?? 0;
    results.push({size, name: c.name, tasks: tasks.map((t) => ({name: t.name, ops: t.result?.throughput.mean ?? 0, ms: t.result?.latency.mean ?? 0, ratio: ours / (t.result?.throughput.mean ?? 1)}))});
    const title = `${size.toLocaleString("en-US")} rows, ${c.name}`;
    if (markdown) {
      console.log(`\n#### ${title}\n\n| library | ops/sec | mean ms | vs fast-multisort |\n|---|---:|---:|---:|`);
      for (const t of results.at(-1).tasks) {
        console.log(`| ${t.name} | ${t.ops.toFixed(0)} | ${t.ms.toFixed(3)} | ${t.ratio.toFixed(2)}× |`);
      }
    } else {
      const table = new Table({head: ["Library", "Ops / sec", "Mean ms", "× slower"]});
      for (const t of results.at(-1).tasks) {
        table.push([t.name, t.ops.toFixed(0), t.ms.toFixed(3), t.ratio.toFixed(2)]);
      }
      console.log(`\n${title}`);
      console.log(table.toString());
    }
  }
}
console.log(`\n${os.cpus()[0].model}, ${os.cpus().length} cores, ${Math.round(os.totalmem() / 2 ** 30)} GB, ${os.type()} ${os.release()}, Node ${process.version}`);
