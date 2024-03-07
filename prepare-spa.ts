import { parseArgs } from "@std/cli";
import * as log from "@std/log";
import { zipToTs } from "./build-tools/binToTs.ts";
import { zipCompress } from "./build-tools/zip.ts";

const flags = parseArgs(Deno.args, {
  string: ["action", "version"],
});

const action = flags.action;
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
  log.getLogger().info("package.json file updated.");
}

async function spaToTypeScript() {
  log.getLogger().info("Compressing [q-manui/dist/spa] ...");
  await zipCompress("./q-manui/dist/spa", "./q-manui/dist/ui.zip", {
    overwrite: true,
    flags: [],
  });

  log.getLogger().info("Converting [q-manui/dist/ui.zip] to [ui.ts]");
  await zipToTs("./q-manui/dist", "ui");
  log.getLogger().info("[ui.ts] created.");
}
