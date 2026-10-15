import {execFileSync} from "node:child_process";
import fs from "node:fs";

import {cases, libraries, makeRows} from "./suite.js";

const [, , caseName, libName, size] = process.argv;
if (libName !== undefined) {
  const rows = makeRows(Number(size));
  const fn = libraries(rows, cases.find((x) => x.name === caseName))[libName];
  const usage = () => {
    const {heapTotal, heapUsed, arrayBuffers} = process.memoryUsage();
    return {reserved: heapTotal + arrayBuffers, used: heapUsed + arrayBuffers};
  };
  global.gc();
  const before = usage();
  let kept = fn();
  const grown = usage().reserved - before.reserved;
  global.gc();
  const retained = usage().used - before.used;
  for (let i = 0; i < 20; i++) {
    kept = fn();
  }
  global.gc();
  const leaked = usage().used - before.used - retained;
  console.log(JSON.stringify({grown, retained, leaked, length: kept.length}));
} else {
  const n = Number(caseName ?? 100_000);
  const rows = [];
  for (const c of cases.filter((x) => x.props.length > 1 || ["name", "moved"].includes(x.props[0]))) {
    console.log(`\n${n.toLocaleString("en-US")} rows, ${c.name}: heap and ArrayBuffer growth during one sort / held after it / left after 20 more sorts`);
    for (const name of Object.keys(libraries(makeRows(10), c))) {
      const out = execFileSync(process.execPath, ["--expose-gc", "benchmark/memory.js", c.name, name, String(n)], {encoding: "utf8"});
      const {grown, retained, leaked} = JSON.parse(out.trim().split("\n").at(-1));
      const mb = (x) => (x / 2 ** 20).toFixed(1).padStart(7);
      console.log(`${name.padEnd(42)} ${mb(grown)} MB ${mb(retained)} MB ${mb(leaked)} MB`);
      rows.push({size: n, name: c.name, library: name, grown, retained, leaked});
    }
  }
  fs.writeFileSync("benchmark/memory.json", `${JSON.stringify(rows, null, 1)}\n`);
}
