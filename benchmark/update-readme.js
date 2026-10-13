import fs from "node:fs";

const [resultsPath = "benchmark/results.md"] = process.argv.slice(2);
const results = fs.readFileSync(resultsPath, "utf8").replace(/\x1b\[[0-9;]*m/g, "");
const readme = fs.readFileSync("README.md", "utf8");
const start = "<!-- bench:start -->";
const end = "<!-- bench:end -->";
const a = readme.indexOf(start);
const b = readme.indexOf(end);
if (a < 0 || b < 0) {
  throw new Error("README markers missing");
}

const stats = new Map();
for (const line of results.split("\n")) {
  const m = line.match(/^\| (.+?) \| \d+ \| [\d.]+ \| ([\d.]+)× \|$/);
  if (!m) {
    continue;
  }
  const differs = / \((different order|threw.*)\)$/.test(m[1]);
  const name = m[1].replace(/ \(.*\)$/, "");
  if (name === "fast-multisort") {
    continue;
  }
  const s = stats.get(name) ?? {ratios: [], differs: 0};
  s.ratios.push(Number(m[2]));
  if (differs) {
    s.differs++;
  }
  stats.set(name, s);
}
const median = (xs) => [...xs].sort((x, y) => x - y)[xs.length >> 1];
const summary = [
  "Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.",
  "",
  "| library | min | median | max | cases | order differs |",
  "|---|---:|---:|---:|---:|---:|",
  ...[...stats]
    .sort((x, y) => median(x[1].ratios) - median(y[1].ratios))
    .map(([name, s]) => {
      const r = [...s.ratios].sort((x, y) => x - y);
      return `| ${name} | ${r[0].toFixed(2)}× | ${median(r).toFixed(2)}× | ${r.at(-1).toFixed(2)}× | ${r.length} | ${s.differs} |`;
    }),
].join("\n");

const body = results.split("\n").filter((line) => line.startsWith("#### ") || line.startsWith("|") || line === "").join("\n").trim();
fs.writeFileSync("README.md", `${readme.slice(0, a + start.length)}\n\n${summary}\n\n<details>\n<summary>Per case</summary>\n\n${body}\n\n</details>\n\n${readme.slice(b)}`);
console.log("README benchmark tables updated");
