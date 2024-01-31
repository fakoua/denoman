import { join } from "https://deno.land/std@0.213.0/path/mod.ts";
import { copy } from "https://deno.land/std@0.213.0/fs/copy.ts";

import { bin } from "../wwwzip/ui.ts";
import { decompress } from "./zip.ts";

export async function initServer(wwwRoot: string): Promise<boolean> {
  try {
    const zipFile = await tsToZip(wwwRoot);
    const indexFile = join(wwwRoot, "index.html");
    const isExist = await exists(indexFile);
    if (isExist) {
      return true;
    }

    await decompress(zipFile, wwwRoot);
    await Deno.remove(zipFile);
    const spa = join(wwwRoot, "spa");
    const spa_assets = join(spa, "assets");
    const spa_icons = join(spa, "icons");

    const www_assets = join(wwwRoot, "assets");
    const www_icons = join(wwwRoot, "icons");

    await copy(spa_assets, www_assets);
    await copy(spa_icons, www_icons);

    await copy(join(spa, "index.html"), join(wwwRoot, "index.html"));
    await copy(join(spa, "favicon.ico"), join(wwwRoot, "favicon.ico"));

    Deno.remove(spa, { recursive: true });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function zipToTs(path: string, fileName: string) {
  const binPath = join(path, `${fileName}.zip`);
  const uint = await Deno.readFile(binPath);

  let binary = "";
  const len = uint.length;

  for (let index = 0; index < len; index++) {
    binary += String.fromCharCode(uint[index]);
  }

  const binBase64 = btoa(binary);
  const base64 = trunString(binBase64, 100);

  const tsFileContent = `export const bin=\`${base64}\``;
  const tsFilePath = join("./wwwzip", `${fileName}.ts`);
  await Deno.writeTextFile(tsFilePath, tsFileContent);
  console.log(`TS File saved to: ${tsFilePath}`);
}

export async function tsToZip(wwwRoot: string): Promise<string> {
  const binContent = atob(bin);
  const binArray = new Uint8Array(binContent.length);

  let ctn = 0;
  binContent.split("").forEach((char) => {
    binArray[ctn++] = char.charCodeAt(0);
  });

  const zipFile = join(wwwRoot, `spa.zip`);
  await Deno.writeFile(zipFile, binArray);
  return zipFile;
}

function trunString(input: string, width: number): string {
  const it = Math.ceil(input.length / width);
  let rtnVal = "";
  for (let index = 0; index < it; index++) {
    rtnVal += input.substring(index * width, index * width + width) + "\r\n";
  }
  return rtnVal;
}

async function exists(filename: string): Promise<boolean> {
  try {
    await Deno.stat(filename);
    // successful, file or directory must exist
    return true;
  } catch (error) {
    if (error && error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}
