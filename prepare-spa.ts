import { parseArgs } from "https://deno.land/std@0.218.2/cli/parse_args.ts";

import { zipToTs } from "./build-tools/binToTs.ts";
import { zipCompress } from "./build-tools/zip.ts";

const flags = parseArgs(Deno.args, {
  string: ["action", "version"],
});

const action = flags.action;
console.log("Action:", flags);
if (action === "set-version") {
  const version = flags.version || "0.0.1";
  await increaseUiVersion(version);
  Deno.exit(0);
}

if (action === "spa") {
  await spaToTypeScript();
  Deno.exit(0);
}

async function increaseUiVersion(version: string) {
  const packageFile = "./q-manui/package.json";
  let packageJson = await Deno.readTextFile(packageFile);
  const pkg = JSON.parse(packageJson);
  pkg.version = version;
  pkg.description = `DenoMan ${version}`;
  packageJson = JSON.stringify(pkg, null, 2);

  await Deno.writeTextFile(packageFile, packageJson);
  console.log("package.json file updated.");
}

async function spaToTypeScript() {
  console.log("Compressing [q-manui/dist/spa] ...");
  await zipCompress("./q-manui/dist/spa", "./q-manui/dist/ui.zip", {
    overwrite: true,
    flags: [],
  });

  console.log("Converting [q-manui/dist/ui.zip] to [ui.ts]");
  await zipToTs("./q-manui/dist", "ui");
  console.log("[ui.ts] created.");
}
