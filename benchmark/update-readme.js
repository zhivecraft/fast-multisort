import fs from "node:fs";

const median = (xs) => [...xs].sort((x, y) => x - y)[xs.length >> 1];

const section = (results) => {
  const stats = new Map();
  for (const line of results.split("\n")) {
    const m = line.match(/^\| (.+?) \| \d+ \| [\d.]+ \| ([\d.]+)× \|$/);
    if (m === null || m[1].startsWith("fast-multisort")) {
      continue;
    }
    const name = m[1].replace(/ \(.*\)$/, "");
    const s = stats.get(name) ?? {ratios: [], differs: 0};
    s.ratios.push(Number(m[2]));
    s.differs += m[1] === name ? 0 : 1;
    stats.set(name, s);
  }
  const rows = [...stats]
    .sort((x, y) => median(x[1].ratios) - median(y[1].ratios))
    .map(([name, {ratios, differs}]) => {
      const r = [...ratios].sort((x, y) => x - y);
      return `| ${name} | ${r[0].toFixed(2)}× | ${median(r).toFixed(2)}× | ${r.at(-1).toFixed(2)}× | ${r.length} | ${differs} |`;
    });
  const body = results
    .split("\n")
    .filter((line) => line.startsWith("#### ") || line.startsWith("|") || line === "")
    .join("\n")
    .trim();
  return [
    "Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.",
    "",
    "| library | min | median | max | cases | order differs |",
    "|---|---:|---:|---:|---:|---:|",
    ...rows,
    "",
    "<details>",
    "<summary>Per case</summary>",
    "",
    body,
    "",
    "</details>",
  ].join("\n");
};

const splice = (text, start, end, content) => {
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a < 0 || b < 0) {
    throw new Error(`README markers ${start} ${end} missing`);
  }
  return `${text.slice(0, a + start.length)}\n\n${content}\n\n${text.slice(b)}`;
};

let readme = fs.readFileSync("README.md", "utf8");
readme = splice(readme, "<!-- bench:start -->", "<!-- bench:end -->", section(fs.readFileSync("benchmark/results.md", "utf8")));
if (fs.existsSync("benchmark/browsers.md")) {
  const engines = fs
    .readFileSync("benchmark/browsers.md", "utf8")
    .split(/^### /m)
    .filter((block) => block.trim() !== "")
    .map((block) => `#### ${block.split("\n")[0]}\n\n${section(block)}`);
  readme = splice(readme, "<!-- browsers:start -->", "<!-- browsers:end -->", engines.join("\n\n"));
}
fs.writeFileSync("README.md", readme);
console.log("README benchmark tables updated");
