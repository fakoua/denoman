import { zipToTs } from "./build-tools/binToTs.ts";
import { compress } from "./build-tools/zip.ts";

console.log("Compressing ...");
await compress("./q-manui/dist/spa", "./q-manui/dist/ui.zip", {
  overwrite: true,
  flags: [],
});
console.log(`Compressed: q-manui/dist/ui.zip`);

console.log("Zip to ts ...");
await zipToTs("./q-manui/dist", "ui");
