import { zipToTs } from "./build-tools/binToTs.ts";
import { compress } from "./build-tools/zip.ts";

await increaseUiVersion();
buildQuasar();
await spaToTypeScript();

function buildQuasar() {
  const msg = "Please go to [./q-manui] and build the project [quasar build].";
  alert(msg);
}

async function increaseUiVersion() {
  const newVersion = prompt("Please enter the new version:");

  const packageFile = "./q-manui/package.json";
  let packageJson = await Deno.readTextFile(packageFile);
  const pkg = JSON.parse(packageJson);
  pkg.version = newVersion;
  pkg.description = `DenoMan ${newVersion}`;
  packageJson = JSON.stringify(pkg, null, 2);

  await Deno.writeTextFile(packageFile, packageJson);
  console.log("package.json file updated.");
}

async function spaToTypeScript() {
  console.log("Compressing [q-manui/dist/spa] ...");
  await compress("./q-manui/dist/spa", "./q-manui/dist/ui.zip", {
    overwrite: true,
    flags: [],
  });

  console.log("Converting [q-manui/dist/ui.zip] to [ui.ts]");
  await zipToTs("./q-manui/dist", "ui");
  console.log("[ui.ts] created.");
}
