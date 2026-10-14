import {markdown, run} from "./suite.js";

globalThis.__results = run((entry) => console.log(`${entry.size} rows, ${entry.name}`)).then((results) => results.map(markdown).join("\n"));
