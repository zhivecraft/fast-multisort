import {execFileSync} from "node:child_process";
import v8 from "node:v8";

import {cases, libraries, makeRows} from "./suite.js";

const [, , caseName, libName, size] = process.argv;
if (libName !== undefined) {
  const rows = makeRows(Number(size));
  const c = cases.find((x) => x.name === caseName);
  const fn = libraries(rows, c)[libName];
  global.gc();
  const before = process.memoryUsage().heapUsed;
  const peakBefore = v8.getHeapStatistics().total_heap_size;
  const kept = fn();
  const peak = v8.getHeapStatistics().total_heap_size;
  global.gc();
  const after = process.memoryUsage().heapUsed;
  console.log(JSON.stringify({retained: after - before, grown: peak - peakBefore, length: kept.length}));
} else {
  const n = Number(caseName ?? 1_000_000);
  for (const c of cases.filter((x) => x.props.length > 1 || x.props[0] === "name")) {
    console.log(`\n${n.toLocaleString("en-US")} rows, ${c.name}: heap growth during the sort / retained by the result`);
    for (const name of Object.keys(libraries(makeRows(10), c))) {
      const out = execFileSync(process.execPath, ["--expose-gc", "--max-old-space-size=32768", "benchmark/memory.js", c.name, name, String(n)], {encoding: "utf8"});
      const {grown, retained} = JSON.parse(out.trim().split("\n").at(-1));
      console.log(`${name.padEnd(42)} ${(grown / 2 ** 20).toFixed(0).padStart(6)} MB  ${(retained / 2 ** 20).toFixed(0).padStart(6)} MB`);
    }
  }
}
