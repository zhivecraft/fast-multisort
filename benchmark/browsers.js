import {execFileSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {chromium, firefox, webkit} from "playwright";

import {evaluateInFirefox, firefoxVersion} from "./firefox-bidi.js";

execFileSync("node_modules/.bin/esbuild", ["benchmark/browser-entry.js", "--bundle", "--format=iife", "--outfile=benchmark/.browser-bundle.js", "--log-level=error"]);
const bundle = path.resolve("benchmark/.browser-bundle.js");
const page = path.resolve("benchmark/.browser-page.html");
fs.writeFileSync(page, `<!doctype html><meta charset="utf-8"><script src="${pathToFileURL(bundle).href}"></script>`);
const pageUrl = pathToFileURL(page).href;

const viaPlaywright = (engine) => async () => {
  const browser = await engine.launch({timeout: 60_000});
  try {
    const tab = await browser.newPage();
    await tab.goto(pageUrl, {timeout: 120_000});
    return {version: browser.version(), markdown: await tab.evaluate(() => globalThis.__results)};
  } finally {
    await browser.close();
  }
};

const viaStockFirefox = async () => ({
  version: firefoxVersion(),
  markdown: await evaluateInFirefox(pageUrl, "globalThis.__results"),
});

const engines = [
  ["Chromium", viaPlaywright(chromium)],
  ["WebKit", viaPlaywright(webkit)],
  ["Firefox", () => (firefoxVersion() === null ? viaPlaywright(firefox)() : viaStockFirefox())],
];

const sections = [];
for (const [label, engine] of engines) {
  const outcome = await engine().catch((error) => {
    console.error(`${label} did not run: ${String(error.message).split("\n")[0]}`);
    return null;
  });
  if (outcome !== null) {
    sections.push(`### ${label} ${outcome.version}\n${outcome.markdown}`);
  }
}
fs.writeFileSync("benchmark/browsers.md", `${sections.join("\n\n")}\n`);
console.log(sections.join("\n\n"));
