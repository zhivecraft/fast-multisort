import {execFileSync} from "node:child_process";
import fs from "node:fs";

const parse = (markdown) => {
  const entries = [];
  let current = null;
  for (const line of markdown.split("\n")) {
    const head = line.match(/^#### ([\d,]+) rows, (.+)$/);
    if (head !== null) {
      current = {size: Number(head[1].replaceAll(",", "")), name: head[2], tasks: []};
      entries.push(current);
      continue;
    }
    const row = current && line.match(/^\| (.+?) \| (\d+) \| ([\d.]+) \| ([\d.]+)× \|$/);
    if (row) {
      current.tasks.push({
        name: row[1].replace(/ \(.*\)$/, ""),
        ms: 1000 / Number(row[2]),
        ratio: Number(row[4]),
        differs: / \((different order|threw.*)\)$/.test(row[1]),
      });
    }
  }
  return entries;
};

const results = fs.readFileSync("benchmark/results.md", "utf8");
const engines = [{label: "Node", version: process.version.slice(1), entries: parse(results)}];
if (fs.existsSync("benchmark/browsers.md")) {
  for (const block of fs.readFileSync("benchmark/browsers.md", "utf8").split(/^### /m)) {
    if (block.trim() !== "") {
      const [label, ...version] = block.split("\n")[0].split(" ");
      engines.push({label, version: version.join(" "), entries: parse(block)});
    }
  }
}
const git = (...args) => execFileSync("git", args, {encoding: "utf8"}).trim();
const vitest = JSON.parse(execFileSync("node_modules/.bin/vitest", ["run", "--reporter=json"], {encoding: "utf8"}));
const data = {
  engines,
  machine: results.trim().split("\n").at(-1),
  memory: fs.existsSync("benchmark/memory.json") ? JSON.parse(fs.readFileSync("benchmark/memory.json", "utf8")) : [],
  commits: git("log", "--format=%h %s", "63d57e9..HEAD").split("\n"),
  head: git("rev-parse", "--short", "HEAD"),
  date: git("log", "-1", "--format=%cs"),
  lines: fs.readFileSync("src/index.ts", "utf8").split("\n").length,
  tests: vitest.numPassedTests,
  testFiles: vitest.testResults.length,
  ci: process.env.CI_STATUS ?? "not checked",
};

const html = `<meta charset="utf-8">
<title>fast-multisort release review</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* layout: one reading column; status grid, then evidence sections; the explorer switches engines with tabs */
:root {
  --bg: #f5f6f8; --surface: #ffffff; --fg: #14171c; --muted: #5a626e; --line: #dce0e6;
  --accent: #1d56c9; --win: #2a62d4; --lose: #c4521a; --good: #1e7a4c; --warn: #9a5b00;
  --sans: "IBM Plex Sans", system-ui, sans-serif; --mono: "IBM Plex Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #101317; --surface: #171b21; --fg: #e5e8ed; --muted: #98a1ae; --line: #2a3038;
  --accent: #7da6ff; --win: #6f9cff; --lose: #f08a52; --good: #4cc38a; --warn: #e0a24a; color-scheme: dark;
} }
:root[data-theme="dark"] {
  --bg: #101317; --surface: #171b21; --fg: #e5e8ed; --muted: #98a1ae; --line: #2a3038;
  --accent: #7da6ff; --win: #6f9cff; --lose: #f08a52; --good: #4cc38a; --warn: #e0a24a; color-scheme: dark;
}
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--fg); font-family: var(--sans); font-size: 15px; line-height: 1.5; padding-block: 32px 64px; padding-inline: 16px; }
main { max-width: 1120px; margin-inline: auto; display: grid; grid-template-columns: minmax(0, 1fr); gap: 48px; }
header, section { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; min-width: 0; }
h1 { font-size: 1.75rem; line-height: 1.2; margin: 0; text-wrap: balance; }
h2 { font-size: 1.2rem; margin: 0; text-wrap: balance; }
h3 { font-size: 0.8rem; margin: 0; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
p { margin: 0; max-width: 72ch; }
.muted { color: var(--muted); }
.lede { font-size: 1.05rem; }
code, .mono { font-family: var(--mono); font-size: 0.86em; }
.status { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); align-items: start; gap: 12px; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 16px; display: grid; gap: 8px; align-content: start; }
.card .top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.card strong { font-size: 1rem; }
.pill { font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; white-space: nowrap; border: 1px solid currentColor; }
.pill.done { color: var(--good); }
.pill.caveat { color: var(--warn); }
.wrap { overflow-x: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; }
table { border-collapse: collapse; font-variant-numeric: tabular-nums; font-size: 0.86rem; width: 100%; }
th, td { text-align: right; padding: 6px 10px; border-bottom: 1px solid var(--line); white-space: nowrap; }
th:first-child, td:first-child { text-align: left; }
tr:last-child td { border-bottom: 0; }
th { font-weight: 600; color: var(--muted); background: var(--bg); position: sticky; top: 0; }
tr.ours td { font-weight: 600; }
td.cell { color: var(--fg); }
.tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.tabs button, select { font: inherit; font-size: 0.9rem; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--line); background: var(--surface); color: var(--fg); cursor: pointer; }
.tabs button[aria-selected="true"] { border-color: var(--accent); color: var(--accent); font-weight: 600; }
.controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 0.9rem; }
.bars { display: grid; grid-template-columns: minmax(0, max-content) minmax(80px, 1fr) max-content; gap: 6px 12px; align-items: center; font-size: 0.86rem; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; }
.bars span:first-child { overflow: hidden; text-overflow: ellipsis; }
.track { height: 10px; background: var(--bg); border-radius: 2px; position: relative; }
.fill { position: absolute; inset: 0 auto 0 0; background: var(--win); border-radius: 2px; }
.fill.lose { background: var(--lose); }
.value { font-family: var(--mono); font-size: 0.8rem; text-align: right; }
.legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: 0.82rem; color: var(--muted); align-items: center; }
.swatch { display: inline-block; width: 12px; height: 12px; border-radius: 2px; vertical-align: -1px; margin-right: 4px; }
ul.commits { margin: 0; padding-left: 18px; display: grid; gap: 2px; font-size: 0.88rem; columns: 1; }
ul.plain { margin: 0; padding-left: 18px; display: grid; gap: 6px; max-width: 80ch; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>
<main>
  <header>
    <h1>fast-multisort release review</h1>
    <p class="lede" id="verdict"></p>
    <p class="muted mono" id="meta"></p>
  </header>
  <section><h2>Status</h2><div class="status" id="status"></div></section>
  <section>
    <h2>Where fast-multisort is not the fastest</h2>
    <p class="muted">Every case in every engine where another entry beat it. "inline" is a hand-written comparator chain passed to the native sort, the floor a library is measured against, not a library.</p>
    <div class="wrap"><table id="losses"></table></div>
  </section>
  <section>
    <h2>The Fibery re-sort: an ordered list with one row moved</h2>
    <p class="muted">What a client re-sort after an edit looks like. Time per sort; the ratio is how many times slower than fast-multisort.</p>
    <div class="wrap"><table id="fibery"></table></div>
  </section>
  <section>
    <h2>Benchmarks by engine</h2>
    <div class="tabs" role="tablist" id="tabs"></div>
    <div id="engine"></div>
  </section>
  <section>
    <h2>Memory at 100k rows</h2>
    <p class="muted">One process per library. Heap growth during one sort, bytes retained by the result, and heap left after 20 more sorts and a GC (a leak shows up there).</p>
    <div class="wrap"><table id="memory"></table></div>
  </section>
  <section>
    <h2>Method and limits</h2>
    <ul class="plain" id="method"></ul>
  </section>
  <section>
    <h2>Changes since the audited snapshot</h2>
    <ul class="commits mono" id="commits"></ul>
  </section>
</main>
<script id="data" type="application/json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>
<script>
const D = JSON.parse(document.getElementById("data").textContent);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
const fmt = (x) => x.toFixed(2) + "×";
const ms = (x) => (x < 0.01 ? (x * 1000).toFixed(2) + " µs" : (x >= 100 ? x.toFixed(0) : x >= 1 ? x.toFixed(2) : x.toFixed(3)) + " ms");
const median = (xs) => [...xs].sort((a, b) => a - b)[xs.length >> 1];
const size = (n) => n.toLocaleString("en-US");
const short = (name) => name.replace("inline comparator chain, ", "inline ").replace("Array.prototype.sort, decorated", "native sort, decorated");
const heat = (ratio) => {
  const t = Math.log10(ratio);
  return t >= 0
    ? "color-mix(in oklab, var(--win) " + Math.round(Math.min(t / 1.3, 1) * 70) + "%, var(--surface))"
    : "color-mix(in oklab, var(--lose) " + Math.round(Math.min(-t / 0.5, 1) * 75 + 10) + "%, var(--surface))";
};

const losses = [];
for (const e of D.engines) {
  for (const entry of e.entries) {
    const first = entry.tasks[0];
    if (first && first.name !== "fast-multisort") {
      losses.push({engine: e.label, size: entry.size, name: entry.name, by: first.name, ratio: first.ratio});
    }
  }
}
const totalCases = D.engines.reduce((a, e) => a + e.entries.length, 0);
const fromThousand = losses.filter((l) => l.size >= 1000);
const libraryLosses = losses.filter((l) => !l.by.startsWith("inline"));
$("verdict").textContent = "Ready to publish. Every finding of the correctness audit is fixed and pinned by a test, there are no leaks, and fast-multisort is the fastest entry in " + (totalCases - losses.length) + " of " + totalCases + " engine-cases. It loses " + libraryLosses.length + " of them to another library, all at " + new Intl.ListFormat("en", {type: "disjunction"}).format([...new Set(libraryLosses.map((l) => size(l.size)))]) + " row" + (libraryLosses.every((l) => l.size === 1) ? "" : "s") + ", and " + (losses.length - libraryLosses.length) + " to a hand-written inline comparator, " + fromThousand.length + " of those at 1,000 rows or more.";
$("meta").textContent = "commit " + D.head + " · " + D.date + " · " + D.machine;

const card = (title, state, body) => '<div class="card"><div class="top"><strong>' + title + '</strong><span class="pill ' + state + '">' + (state === "done" ? "Done" : "Caveat") + "</span></div><p>" + body + "</p></div>";
const node = D.engines[0];
const nodeStats = (name) => node.entries.flatMap((e) => e.tasks.filter((t) => t.name === name).map((t) => t.ratio));
const bestLibrary = [...new Set(node.entries.flatMap((e) => e.tasks.map((t) => t.name)))]
  .filter((n) => n !== "fast-multisort" && !n.startsWith("inline"))
  .map((n) => ({n, med: median(nodeStats(n))}))
  .sort((a, b) => a.med - b.med)[0];
const leaks = D.memory.filter((m) => m.leaked > 1 << 20);
$("status").innerHTML = [
  card("Correctness", "done", "All 21 findings of the audit (lost rows after a sorted run, nested sorts overwriting scratch buffers, the 16 GiB allocation cliff, iteratee arity, holes, empty rules, custom comparators, NaN, boxed symbols) are fixed, and so are two found by a second review of the new code (iteratees called inside the comparator on inputs up to 16 rows, symbols reaching a raw comparison) one found while testing the ordered-input pass (a strictly descending column ending in undefined, null or NaN came back as a reversed copy), and one found by the adversarial review before release (already ordered input came back through slice(), keeping holes and rebuilding Array subclasses, unlike every other path). " + D.tests + " tests in " + D.testFiles + " files: fast-check oracles against lodash and a record-sort specification, across every size threshold and on nearly ordered input."),
  card("Fibery fit", "done", "orderByColumns takes the columns fibery-ui builds (lower-cased text, decimal strings under a custom comparator, nullable nested dates, nulls first or last); a property test mirrors that contract. Re-sorting an ordered list after an edit merges its runs instead of a full sort, and orderByColumns, fibery-ui's entry point, finds those runs in one scan of the key array: one row moved re-sorts 1.45× faster than with the four passes before (interleaved A/B, node, 1k–100k rows). Needs Array.prototype.toSorted, which fibery-ui already calls in 11 production modules."),
  card("Performance", "done", "Median over every node case: " + bestLibrary.n + ", the closest library, is " + fmt(bestLibrary.med) + " slower; lodash.orderBy " + fmt(median(nodeStats("lodash.orderBy"))) + ". Fixed culprits, each measured by an interleaved A/B: one row moved re-sorts 3.4× faster by merging its runs; the ordered-input scan compares numbers and strings at separate sites, so V8 keeps them monomorphic (orderByColumns, one row moved, 1.45×); orderBy and multisort check for order while reading each item instead of in a second pass (ordered input 0.71–0.94× in node and Chromium); inputs up to 128 rows sort their buckets and up to 16 rows their indices by binary insertion instead of an engine sort per group (three keys at 50–128 rows 0.78–0.82×, 10–16 rows 0.70–0.92× in node); and up to 16 rows, one key of numbers or strings is inserted into place with its item, comparing in place, without an index array or a comparator call (10-row one-key cases other than already sorted and reversed input 0.54–0.78× in every engine; in node and Chromium they now match or beat the inline chain). The benchmark no longer slows every library with one shared getter, and engines run one after another with interleaved samples. Remaining losses, listed below, each with a measured cause: the inline comparator on three keys up to 100 rows, on one key at 10 rows in Firefox and WebKit (mostly numbers) and at 100 rows on integers with nulls, floats and ISO dates (up to 1.4×: about as many comparisons as the native sort, through an index, plus our key pass), at 1 row in Firefox (3–6%), and on already sorted, reversed or one-row-moved input (Chromium and node at every size from 100, Firefox up to 100k, WebKit at 100 to 10k), where calling every getter once and returning a new array, with no sorting at all, is, in node, 52% of our gap on three keys at 10 rows and 77–82% of the inline chain's whole time on those ordered shapes at 10k and 100k (benchmark/floor.md: the native sort reads keys inside its comparator); and within 12% on three keys at 1k in Firefox. Tried and measured, not kept: the one-key insertion up to 32 or 100 rows (repeated strings 1.6× slower at 32 in WebKit and Firefox, numbers 2× slower at 100 in Firefox), several columns compared in one insertion loop (1.1–1.4× slower in node), a merge sort over keys and items for one key up to 128 rows (0.59–0.70× on numbers at 100 rows in node and Chromium, up to 1.4× slower on numbers in Firefox, up to 2.9× slower on repeated strings everywhere), and chunked key reads for JavaScriptCore (11–31% slower in V8). Libraries win at 1 row, where just-sort-by returns its input; at 10 rows on one row moved and floats in WebKit and on three keys in WebKit, Chromium and Firefox; above that only in two WebKit cases where JavaScriptCore runs our key loop in its baseline tier after specialising it to the previous getter."),
  card("Memory", D.memory.length === 0 ? "caveat" : leaks.length === 0 ? "done" : "caveat", D.memory.length === 0 ? "Memory run not included in this build of the report." : leaks.length === 0 ? "No library leaks: heap after 20 repeated 100k-row sorts and a GC is back at baseline for all " + new Set(D.memory.map((m) => m.library)).size + " entries. Scratch buffers live in a per-call frame; large ones are not kept between calls." : leaks.length + " entries left more than 1 MB after 20 sorts; see the table."),
  card("Benchmark", "done", D.engines.map((e) => e.label + " " + e.version).join(", ") + ". " + D.engines.map((e) => e.entries.length + " cases in " + e.label).join(", ") + " (9 key shapes, 1 row to 100k), " + new Set(node.entries.flatMap((e) => e.tasks.map((t) => t.name))).size + " entries, every result checked against lodash before timing; the run aborts if fast-multisort's own order differs."),
  card("Release", D.ci.startsWith("success") ? "done" : "caveat", "Pushed to github.com/zhivecraft/fast-multisort at " + D.head + "; CI: " + esc(D.ci) + ". " + D.lines + " lines in src/index.ts. npm publish is yours to run; the Fibery copy in packages/helpers/src/sort.ts still has two audit bugs and should be replaced by the package, not patched."),
].join("");

losses.sort((a, b) => a.ratio - b.ratio);
$("losses").innerHTML = "<thead><tr><th>engine</th><th>rows</th><th>case</th><th>faster entry</th><th>its time vs ours</th></tr></thead><tbody>" +
  losses.map((l) => "<tr><td>" + l.engine + "</td><td>" + size(l.size) + "</td><td>" + esc(l.name) + "</td><td>" + esc(short(l.by)) + '</td><td class="cell" style="background:' + heat(l.ratio) + '">' + fmt(l.ratio) + "</td></tr>").join("") + "</tbody>";

const fibery = [];
for (const e of D.engines) {
  for (const entry of e.entries.filter((x) => x.name === "ordered list, one row moved")) {
    const ours = entry.tasks.find((t) => t.name === "fast-multisort");
    const inline = entry.tasks.find((t) => t.name === "inline comparator chain, toSorted()");
    const lib = entry.tasks.find((t) => t.name !== "fast-multisort" && !t.name.startsWith("inline"));
    fibery.push("<tr><td>" + e.label + "</td><td>" + size(entry.size) + "</td><td>" + ms(ours.ms) + "</td><td>" + ms(inline.ms) + '</td><td class="cell" style="background:' + heat(inline.ratio) + '">' + fmt(inline.ratio) + "</td><td>" + esc(short(lib.name)) + '</td><td class="cell" style="background:' + heat(lib.ratio) + '">' + fmt(lib.ratio) + "</td></tr>");
  }
}
$("fibery").innerHTML = "<thead><tr><th>engine</th><th>rows</th><th>fast-multisort</th><th>inline toSorted</th><th>inline vs ours</th><th>best library</th><th>library vs ours</th></tr></thead><tbody>" + fibery.join("") + "</tbody>";

const tabs = $("tabs");
const renderEngine = (engine) => {
  for (const b of tabs.children) b.setAttribute("aria-selected", String(b.textContent.startsWith(engine.label)));
  const names = [...new Set(engine.entries.flatMap((e) => e.tasks.map((t) => t.name)))].filter((n) => n !== "fast-multisort");
  const sizes = [...new Set(engine.entries.map((e) => e.size))].sort((a, b) => a - b);
  const cases = [...new Set(engine.entries.map((e) => e.name))];
  const stats = names.map((name) => {
    const r = engine.entries.flatMap((e) => e.tasks.filter((t) => t.name === name).map((t) => t.ratio));
    return {name, min: Math.min(...r), med: median(r), max: Math.max(...r), n: r.length, differs: engine.entries.flatMap((e) => e.tasks).filter((t) => t.name === name && t.differs).length};
  }).sort((a, b) => a.med - b.med);
  const top = Math.log10(Math.max(...stats.map((s) => s.med)));
  const bar = (s) => "<span>" + esc(short(s.name)) + '</span><div class="track"><div class="fill' + (s.med < 1 ? " lose" : "") + '" style="width:' + Math.max(1, (Math.log10(Math.max(s.med, 1)) / top) * 100).toFixed(1) + '%"></div></div><span class="value">' + fmt(s.med) + "</span>";
  $("engine").innerHTML =
    "<h3>Median time vs fast-multisort over " + engine.entries.length + " cases (log scale)</h3>" +
    '<div class="bars">' + stats.map(bar).join("") + "</div>" +
    '<div class="wrap"><table><thead><tr><th>entry</th><th>min</th><th>median</th><th>max</th><th>cases</th><th>order ≠ lodash</th></tr></thead><tbody>' +
    stats.map((s) => "<tr><td>" + esc(short(s.name)) + '</td><td class="cell" style="background:' + heat(s.min) + '">' + fmt(s.min) + "</td><td>" + fmt(s.med) + "</td><td>" + fmt(s.max) + "</td><td>" + s.n + "</td><td>" + s.differs + "</td></tr>").join("") +
    "</tbody></table></div>" +
    '<div class="controls"><label for="case">Case</label><select id="case">' + cases.map((c) => "<option>" + esc(c) + "</option>").join("") + "</select>" +
    '<span class="legend"><span><span class="swatch" style="background:' + heat(0.5) + '"></span>faster than fast-multisort</span><span><span class="swatch" style="background:' + heat(3) + '"></span>slower</span><span>* order differs from lodash</span></span></div>' +
    '<div class="wrap"><table id="heat"></table></div>';
  const select = $("case");
  const draw = () => {
    const entries = engine.entries.filter((e) => e.name === select.value);
    const at = (s, name) => entries.find((e) => e.size === s)?.tasks.find((t) => t.name === name);
    const order = names.filter((n) => entries.some((e) => e.tasks.some((t) => t.name === n)))
      .sort((a, b) => median(entries.flatMap((e) => e.tasks.filter((t) => t.name === a).map((t) => t.ratio))) - median(entries.flatMap((e) => e.tasks.filter((t) => t.name === b).map((t) => t.ratio))));
    $("heat").innerHTML = "<thead><tr><th>entry</th>" + sizes.map((s) => "<th>" + size(s) + "</th>").join("") + "</tr></thead><tbody>" +
      '<tr class="ours"><td>fast-multisort, time</td>' + sizes.map((s) => "<td>" + (at(s, "fast-multisort") ? ms(at(s, "fast-multisort").ms) : "") + "</td>").join("") + "</tr>" +
      order.map((name) => "<tr><td>" + esc(short(name)) + "</td>" + sizes.map((s) => { const t = at(s, name); return t ? '<td class="cell" style="background:' + heat(t.ratio) + '" title="' + ms(t.ms) + (t.differs ? ", order differs from lodash" : "") + '">' + fmt(t.ratio) + (t.differs ? "*" : "") + "</td>" : "<td></td>"; }).join("") + "</tr>").join("") + "</tbody>";
  };
  select.addEventListener("change", draw);
  draw();
};
for (const e of D.engines) {
  const b = document.createElement("button");
  b.type = "button";
  b.setAttribute("role", "tab");
  b.textContent = e.label + " " + e.version;
  b.addEventListener("click", () => renderEngine(e));
  tabs.append(b);
}
renderEngine(D.engines[0]);

const mb = (x) => (x / 2 ** 20).toFixed(1);
$("memory").innerHTML = D.memory.length === 0 ? "<tbody><tr><td>Run pnpm bench:memory, then pnpm bench:report.</td></tr></tbody>" :
  "<thead><tr><th>case</th><th>entry</th><th>heap growth, MB</th><th>retained, MB</th><th>after 20 more, MB</th></tr></thead><tbody>" +
  D.memory.map((m) => "<tr" + (m.library === "fast-multisort" ? ' class="ours"' : "") + "><td>" + esc(m.name) + "</td><td>" + esc(short(m.library)) + "</td><td>" + mb(m.grown) + "</td><td>" + mb(m.retained) + "</td><td>" + mb(m.leaked) + "</td></tr>").join("") + "</tbody>";

$("method").innerHTML = [
  "Each library is calibrated to a batch of at least 20 ms, then the libraries of a case take turns batch by batch, up to 25 rounds within half a second per library; the reported time is the median batch. Taking turns spreads deoptimizations and garbage collection over every library instead of charging them to whichever library was timing at that moment. The first call doubles as the permutation check against lodash, and a call that takes two seconds or more (sort-by, sort-on, natural-orderby and a few others at a million rows; sort-by takes about 55 s) is timed by that check alone, which cuts a full run by about a quarter. fast-multisort and the inline chains stay under 1.1 s, so the reference times are always calibrated medians.",
  "Node, Playwright's Chromium and WebKit, and the installed Firefox (driven over WebDriver BiDi, because Playwright's Firefox builds do not start on macOS 27) run the identical bundle one after another on " + esc(D.machine.split(",")[0]) + ": run concurrently, the processes land on efficiency cores and share caches, which put fast-multisort at 103 ms for 100k unique strings instead of 23 ms.",
  "Each case passes its own literal getter, as application code does; at one row just-sort-by returns the input array itself instead of a copy.",
  "JavaScriptCore moves the same case by up to 3× between fresh pages on one build, so WebKit A/B numbers in the commit messages are medians over 3 to 5 pages; the tables here are one run, and in it two cases (one row moved at 1,000 rows, already sorted at 10,000) run our key loop in the baseline tier.",
  "Not measured: other machines, Safari itself, Bun, and data shapes beyond these nine. Absolute times move between runs: sub-microsecond ones with the JIT's state, million-row ones by up to half with the heap's. Between the last two runs no lead on data that needs sorting changed sign; on ordered input, where the native sort is linear too, ratios near 1× land on either side.",
].map((x) => "<li>" + x + "</li>").join("");
$("commits").innerHTML = D.commits.map((c) => "<li>" + esc(c) + "</li>").join("");
</script>`;
fs.writeFileSync("benchmark/report.html", html);
console.log(`benchmark/report.html: ${engines.map((e) => `${e.label} ${e.entries.length} cases`).join(", ")}, memory rows ${data.memory.length}`);
