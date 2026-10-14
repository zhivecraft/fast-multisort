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

const progress = (label) => (text) => console.error(`${new Date().toISOString().slice(11, 19)} ${label}: ${text}`);

const viaPlaywright = (engine, label, args = []) => async () => {
  const browser = await engine.launch({timeout: 60_000, args});
  try {
    const tab = await browser.newPage();
    tab.on("console", (message) => progress(label)(message.text()));
    await tab.goto(pageUrl, {timeout: 120_000});
    return {version: browser.version(), markdown: await tab.evaluate(() => globalThis.__results)};
  } finally {
    await browser.close();
  }
};

const viaStockFirefox = async () => ({
  version: firefoxVersion(),
  markdown: await evaluateInFirefox(pageUrl, "globalThis.__results", progress("Firefox")),
});

const engines = [
  ["Chromium", viaPlaywright(chromium, "Chromium", ["--js-flags=--max-old-space-size=16384"])],
  ["WebKit", viaPlaywright(webkit, "WebKit")],
  ["Firefox", () => (firefoxVersion() === null ? viaPlaywright(firefox, "Firefox")() : viaStockFirefox())],
];

const only = process.env.ENGINES?.split(",");
const previous = fs.existsSync("benchmark/browsers.md") ? fs.readFileSync("benchmark/browsers.md", "utf8").split(/^(?=### )/m).filter((b) => b.trim()) : [];
const sections = await Promise.all(
  engines.map(async ([label, engine]) => {
    if (only !== undefined && !only.includes(label)) {
      return previous.find((block) => block.startsWith(`### ${label} `))?.trim() ?? null;
    }
    const outcome = await engine().catch((error) => {
      console.error(`${label} did not run: ${String(error.message).split("\n")[0]}`);
      return null;
    });
    return outcome === null ? null : `### ${label} ${outcome.version}\n${outcome.markdown}`;
  })
).then((all) => all.filter((section) => section !== null));
fs.writeFileSync("benchmark/browsers.md", `${sections.join("\n\n")}\n`);
console.log(sections.join("\n\n"));
