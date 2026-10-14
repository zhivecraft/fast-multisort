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
      const differs = / \((different order|threw.*)\)$/.test(row[1]);
      current.tasks.push({name: row[1].replace(/ \(.*\)$/, ""), ms: Number(row[3]), ratio: Number(row[4]), differs});
    }
  }
  return entries;
};

const engines = [{label: "Node", version: process.version, entries: parse(fs.readFileSync("benchmark/results.md", "utf8"))}];
if (fs.existsSync("benchmark/browsers.md")) {
  for (const block of fs.readFileSync("benchmark/browsers.md", "utf8").split(/^### /m)) {
    if (block.trim() === "") {
      continue;
    }
    const [label, ...version] = block.split("\n")[0].split(" ");
    engines.push({label, version: version.join(" "), entries: parse(block)});
  }
}
const machine = fs.readFileSync("benchmark/results.md", "utf8").trim().split("\n").at(-1);
const data = JSON.stringify({engines, machine});

const html = `<title>fast-multisort benchmarks</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* layout: one column of engine sections, each a summary table, a heatmap and a bar chart */
:root {
  --bg: #f7f6f3; --fg: #1d1c1a; --muted: #6b675f; --line: #d9d5cc; --surface: #ffffff;
  --accent: #0b5fff; --bar: #8fa3b8; --heat-0: #ffffff; --heat-1: #1f4e79;
  --font: "IBM Plex Sans", system-ui, sans-serif; --mono: "IBM Plex Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #16181c; --fg: #e8e6e1; --muted: #9a978f; --line: #33363c; --surface: #1f2227;
  --accent: #6ea0ff; --bar: #5c6f84; --heat-0: #1f2227; --heat-1: #9ec5ec; color-scheme: dark;
} }
:root[data-theme="dark"] {
  --bg: #16181c; --fg: #e8e6e1; --muted: #9a978f; --line: #33363c; --surface: #1f2227;
  --accent: #6ea0ff; --bar: #5c6f84; --heat-0: #1f2227; --heat-1: #9ec5ec; color-scheme: dark;
}
body { background: var(--bg); color: var(--fg); font-family: var(--font); line-height: 1.45; padding-block: 24px; padding-inline: 16px; }
main { max-width: 1100px; margin-inline: auto; display: grid; gap: 40px; }
h1 { font-size: 1.6rem; margin: 0; text-wrap: balance; }
h2 { font-size: 1.2rem; margin: 0; }
h3 { font-size: 1rem; margin: 0; color: var(--muted); font-weight: 600; }
p { max-width: 70ch; margin: 0; }
.muted { color: var(--muted); }
section { display: grid; gap: 16px; }
.wrap { overflow-x: auto; }
table { border-collapse: collapse; font-variant-numeric: tabular-nums; font-size: 0.9rem; min-width: 100%; }
th, td { text-align: right; padding: 4px 10px; border-bottom: 1px solid var(--line); white-space: nowrap; }
th:first-child, td:first-child { text-align: left; }
th { font-weight: 600; color: var(--muted); }
tr.ours td { font-weight: 600; }
.heat td.cell { color: var(--fg); }
.controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 0.9rem; }
select { font: inherit; padding: 4px 8px; background: var(--surface); color: var(--fg); border: 1px solid var(--line); border-radius: 4px; }
.bars { display: grid; grid-template-columns: max-content 1fr max-content; gap: 6px 10px; align-items: center; font-size: 0.85rem; }
.bars .track { height: 10px; background: var(--line); border-radius: 2px; position: relative; }
.bars .fill { position: absolute; inset: 0 auto 0 0; background: var(--bar); border-radius: 2px; }
.bars .ours .fill { background: var(--accent); }
.bars .value { font-family: var(--mono); font-size: 0.8rem; }
code { font-family: var(--mono); font-size: 0.85em; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>
<main>
  <header>
    <h1>fast-multisort against 15 sorters, 1 row to 1 million</h1>
    <p class="muted" id="machine"></p>
    <p>Every run is the same suite: 8 key shapes, 7 sizes, each library checked against the lodash permutation before timing. Ratios are how many times slower a library is than fast-multisort on that case; below 1.00 the library is faster. Node runs via tinybench; the browsers run the identical bundle.</p>
  </header>
  <div id="engines"></div>
</main>
<script id="data" type="application/json">${data}</script>
<script>
const {engines, machine} = JSON.parse(document.getElementById("data").textContent);
document.getElementById("machine").textContent = machine;
const median = (xs) => [...xs].sort((a, b) => a - b)[xs.length >> 1];
const fmt = (x) => x.toFixed(2) + "×";
const heat = (ratio) => {
  const t = Math.max(0, Math.min(1, Math.log10(Math.max(ratio, 0.1)) / 2));
  return "color-mix(in oklab, var(--heat-1) " + Math.round(t * 100) + "%, var(--heat-0))";
};
const root = document.getElementById("engines");
for (const engine of engines) {
  const names = [...new Set(engine.entries.flatMap((e) => e.tasks.map((t) => t.name)))].filter((n) => n !== "fast-multisort");
  const sizes = [...new Set(engine.entries.map((e) => e.size))].sort((a, b) => a - b);
  const cases = [...new Set(engine.entries.map((e) => e.name))];
  const ratios = (name) => engine.entries.flatMap((e) => e.tasks.filter((t) => t.name === name).map((t) => t.ratio));
  const stats = names.map((name) => { const r = ratios(name); return {name, min: Math.min(...r), med: median(r), max: Math.max(...r), n: r.length, differs: engine.entries.flatMap((e) => e.tasks).filter((t) => t.name === name && t.differs).length}; }).sort((a, b) => a.med - b.med);
  const section = document.createElement("section");
  section.innerHTML = \`
    <h2>\${engine.label} \${engine.version} <span class="muted">· \${engine.entries.length} cases</span></h2>
    <h3>Median slowdown per library</h3>
    <div class="bars"></div>
    <h3>All cases</h3>
    <div class="wrap"><table class="summary"><thead><tr><th>library</th><th>min</th><th>median</th><th>max</th><th>cases</th><th>order differs</th></tr></thead><tbody></tbody></table></div>
    <div class="controls"><label>Case <select></select></label><span class="muted">cells: times slower than fast-multisort; fast-multisort row shows its own mean ms</span></div>
    <div class="wrap"><table class="heat"><thead></thead><tbody></tbody></table></div>\`;
  const bars = section.querySelector(".bars");
  const maxMed = Math.max(...stats.map((s) => s.med), 1);
  for (const s of [{name: "fast-multisort", med: 1}, ...stats]) {
    const row = document.createElement("div");
    row.className = "contents";
    row.innerHTML = \`<span>\${s.name}</span><div class="track"><div class="fill" style="width:\${(Math.log10(Math.max(s.med, 0.5)) + 0.31) / (Math.log10(maxMed) + 0.31) * 100}%"></div></div><span class="value">\${fmt(s.med)}</span>\`;
    if (s.name === "fast-multisort") row.querySelectorAll("div.track").forEach((t) => t.classList.add("ours"));
    bars.append(...row.children);
  }
  const tbody = section.querySelector(".summary tbody");
  for (const s of stats) {
    tbody.insertAdjacentHTML("beforeend", \`<tr><td>\${s.name}</td><td>\${fmt(s.min)}</td><td>\${fmt(s.med)}</td><td>\${fmt(s.max)}</td><td>\${s.n}</td><td>\${s.differs}</td></tr>\`);
  }
  const select = section.querySelector("select");
  for (const c of cases) select.insertAdjacentHTML("beforeend", \`<option>\${c}</option>\`);
  const render = () => {
    const entries = engine.entries.filter((e) => e.name === select.value);
    section.querySelector(".heat thead").innerHTML = "<tr><th>library</th>" + sizes.map((s) => \`<th>\${s.toLocaleString("en-US")}</th>\`).join("") + "</tr>";
    const body = section.querySelector(".heat tbody");
    body.innerHTML = "";
    const ours = sizes.map((s) => entries.find((e) => e.size === s)?.tasks.find((t) => t.name === "fast-multisort")?.ms);
    body.insertAdjacentHTML("beforeend", \`<tr class="ours"><td>fast-multisort, ms</td>\${ours.map((ms) => \`<td>\${ms === undefined ? "" : ms < 0.01 ? ms.toFixed(4) : ms.toFixed(3)}</td>\`).join("")}</tr>\`);
    const inCase = names.filter((n) => entries.some((e) => e.tasks.some((t) => t.name === n)));
    inCase.sort((a, b) => median(entries.flatMap((e) => e.tasks.filter((t) => t.name === a).map((t) => t.ratio))) - median(entries.flatMap((e) => e.tasks.filter((t) => t.name === b).map((t) => t.ratio))));
    for (const name of inCase) {
      const cells = sizes.map((s) => { const t = entries.find((e) => e.size === s)?.tasks.find((x) => x.name === name); return t === undefined ? "<td></td>" : \`<td class="cell" style="background:\${heat(t.ratio)}" title="\${t.ms.toFixed(3)} ms\${t.differs ? ", different order" : ""}">\${fmt(t.ratio)}\${t.differs ? "*" : ""}</td>\`; });
      body.insertAdjacentHTML("beforeend", \`<tr><td>\${name}</td>\${cells.join("")}</tr>\`);
    }
  };
  select.addEventListener("change", render);
  render();
  root.append(section);
}
</script>`;
fs.writeFileSync("benchmark/report.html", html);
console.log(`benchmark/report.html: ${engines.map((e) => `${e.label} ${e.entries.length} cases`).join(", ")}`);
