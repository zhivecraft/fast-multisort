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
const body = results.split("\n").filter((line) => line.startsWith("#### ") || line.startsWith("|") || line === "").join("\n").trim();
fs.writeFileSync("README.md", `${readme.slice(0, a + start.length)}\n\n${body}\n\n${readme.slice(b)}`);
console.log("README benchmark tables updated");
