import os from "node:os";

import {orderBy} from "../dist/index.mjs";
import {cases, makeRows, measure} from "./suite.js";

const read = (items, get) => {
  const keys = new Array(items.length);
  for (let i = 0; i < items.length; i++) {
    keys[i] = get(items[i]);
  }
  return keys;
};

const contract = (items, getters) => {
  const out = new Array(items.length);
  for (const get of getters) {
    read(items, get);
  }
  for (let i = 0; i < items.length; i++) {
    out[i] = items[i];
  }
  return out;
};

const us = (ms) => (ms * 1000).toFixed(ms < 0.01 ? 3 : 1);

console.log("| rows | case | fast-multisort µs | getters + copy µs | inline toSorted µs | floor / inline |");
console.log("|---:|---|---:|---:|---:|---:|");
for (const size of [10, 100, 10_000, 100_000]) {
  const items = makeRows(size);
  for (const c of cases) {
    const fns = [() => orderBy(items, c.getters, c.orders), () => contract(items, c.getters), () => items.toSorted(c.inline)];
    const [ours, floor, inline] = measure(fns.map((fn) => ({fn, first: 0})));
    console.log(`| ${size.toLocaleString("en-US")} | ${c.name} | ${us(ours)} | ${us(floor)} | ${us(inline)} | ${(floor / inline).toFixed(2)}× |`);
  }
}
console.log(`\n${os.cpus()[0].model}, Node ${process.version}`);
