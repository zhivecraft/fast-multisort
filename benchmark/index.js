import {orderBy as esToolkitOrderBy} from "es-toolkit";
import {sort as fastSort} from "fast-sort";
import lodashOrderBy from "lodash/orderBy.js";
import sortArray from "sort-array";
import Table from "cli-table3";
import {Bench} from "tinybench";

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
    rank: rand() < 0.1 ? null : (rand() * 1e9) | 0,
    created: new Date(1.7e12 + rand() * 1e10).toISOString(),
    weight: rand(),
  }));

const byName = (x) => x.name;
const byRank = (x) => x.rank;
const byCreated = (x) => x.created;
const byWeight = (x) => x.weight;

const compareNullsLast = (a, b) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  return a < b ? -1 : 1;
};
const nativeMulti = (items, keys, orders) =>
  items
    .map((item, index) => ({item, index}))
    .sort((a, b) => {
      for (let i = 0; i < keys.length; i++) {
        const result = compareNullsLast(keys[i](a.item), keys[i](b.item));
        if (result !== 0) return orders[i] === "desc" ? -result : result;
      }
      return a.index - b.index;
    })
    .map((x) => x.item);

const cases = [
  {
    name: "single string key",
    keys: [byName],
    orders: ["asc"],
    sortArrayBy: ["name"],
  },
  {
    name: "single number key, 10% null",
    keys: [byRank],
    orders: ["asc"],
    sortArrayBy: ["rank"],
  },
  {
    name: "single float key",
    keys: [byWeight],
    orders: ["asc"],
    sortArrayBy: ["weight"],
  },
  {
    name: "three keys, mixed directions",
    keys: [byName, byRank, byCreated],
    orders: ["asc", "desc", "asc"],
    sortArrayBy: ["name", "rank", "created"],
  },
];

const libraries = (rows, c) => ({
  "fast-multisort": () => orderBy(rows, c.keys, c.orders),
  "lodash.orderBy": () => lodashOrderBy(rows, c.keys, c.orders),
  "es-toolkit.orderBy": () => esToolkitOrderBy(rows, c.keys, c.orders),
  "fast-sort": () => fastSort(rows).by(c.keys.map((key, i) => ({[c.orders[i]]: key}))),
  "sort-array": () => sortArray([...rows], {by: c.sortArrayBy, order: c.orders}),
  "Array.prototype.sort (decorated, nulls last)": () => nativeMulti(rows, c.keys, c.orders),
});

const identity = (sorted, rows) => sorted.map((x) => rows.indexOf(x)).join(",");

for (const size of [1_000, 10_000]) {
  const rows = makeRows(size);
  for (const c of cases) {
    const bench = new Bench({time: 500, warmupTime: 100});
    const reference = identity(lodashOrderBy(rows, c.keys, c.orders), rows);
    for (const [name, run] of Object.entries(libraries(rows, c))) {
      let status = "same order as lodash";
      try {
        if (identity(run(), rows) !== reference) {
          status = "different order";
        }
      } catch (error) {
        status = `threw: ${error.message}`;
      }
      bench.add(`${name} (${status})`, run);
    }
    await bench.run();
    const table = new Table({head: ["Name", "Ops / sec", "Mean ms"]});
    for (const task of [...bench.tasks].sort((a, b) => (b.result?.throughput.mean ?? 0) - (a.result?.throughput.mean ?? 0))) {
      table.push([task.name, (task.result?.throughput.mean ?? 0).toFixed(1), (task.result?.latency.mean ?? 0).toFixed(3)]);
    }
    console.log(`\n${size.toLocaleString("en-US")} rows, ${c.name}`);
    console.log(table.toString());
  }
}
