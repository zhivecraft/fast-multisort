import {markdown, run} from "./suite.js";

globalThis.__results = run().then((results) => results.map(markdown).join("\n"));
