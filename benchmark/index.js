import os from "node:os";

import {markdown, run, sizes} from "./suite.js";

const sizesArg = process.argv.find((a) => a.startsWith("--sizes="));
await run((entry) => console.log(markdown(entry)), sizesArg ? sizesArg.slice(8).split(",").map(Number) : sizes);
console.log(`\n${os.cpus()[0].model}, ${os.cpus().length} cores, ${Math.round(os.totalmem() / 2 ** 30)} GB, ${os.type()} ${os.release()}, Node ${process.version}`);
