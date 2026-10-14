import {markdown, run, sizes} from "./suite.js";

const only = new URLSearchParams(location.search).get("sizes")?.split(",").map(Number) ?? sizes;
globalThis.__results = run((entry) => console.log(`${entry.size} rows, ${entry.name}`), only).then((results) => results.map(markdown).join("\n"));
