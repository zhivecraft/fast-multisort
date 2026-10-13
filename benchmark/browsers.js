import {execFileSync} from "node:child_process";
import fs from "node:fs";
import {chromium, firefox, webkit} from "playwright";

execFileSync("node_modules/.bin/esbuild", ["benchmark/browser-entry.js", "--bundle", "--format=iife", "--outfile=benchmark/.browser-bundle.js", "--log-level=error"]);
const code = fs.readFileSync("benchmark/.browser-bundle.js", "utf8");
const lines = [];
for (const [label, engine] of [["Chromium", chromium], ["WebKit", webkit], ["Firefox", firefox]]) {
  const browser = await engine.launch();
  const page = await browser.newPage();
  const version = browser.version();
  const results = await page.evaluate((src) => {
    eval(src);
    return globalThis.__results;
  }, code);
  await browser.close();
  lines.push(`\n#### ${label} ${version}\n\n| case | fast-multisort ms | runner-up | runner-up ms | lead |`, "|---|---:|---|---:|---:|");
  for (const {size, name, libs, different} of results) {
    const ours = libs["fast-multisort"];
    const [runner, ms] = Object.entries(libs).filter(([n]) => n !== "fast-multisort").sort((a, b) => a[1] - b[1])[0];
    const status = different.includes(runner) ? " (different order)" : "";
    lines.push(`| ${size.toLocaleString("en-US")} rows, ${name} | ${ours.toFixed(3)} | ${runner}${status} | ${ms.toFixed(3)} | ${(ms / ours).toFixed(2)}× |`);
  }
}
const out = lines.join("\n");
fs.writeFileSync("benchmark/browsers.md", `${out.trim()}\n`);
console.log(out);
