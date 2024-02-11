import { join } from "https://deno.land/std@0.213.0/path/mod.ts";
import { copy } from "https://deno.land/std@0.213.0/fs/copy.ts";

import { bin, version } from "../wwwzip/ui.ts";
import { decompress } from "./zip.ts";

export async function initServer(wwwRoot: string): Promise<boolean> {
  try {
    const indexFile = join(wwwRoot, "index.html");
    const isExist = await exists(indexFile);
    if (isExist) {
      //Check for update
      const installedVersion = await getUiVersion(indexFile);

      if (installedVersion === version) {
        return true;
      }

      console.log(`Updating UI from V${installedVersion} to V${version}`);
      //We need to remove old version
      await Deno.remove(indexFile);
      await Deno.remove(join(wwwRoot, "favicon.ico"));
      await Deno.remove(join(wwwRoot, "assets"), { recursive: true });
      await Deno.remove(join(wwwRoot, "icons"), { recursive: true });
    }

    const zipFile = await tsToZip(wwwRoot);

    //Decompress zip file
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

    await Deno.remove(spa, { recursive: true });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * Convert zip file to base64 ts
 * @date 2/3/2024 - 6:23:34 PM
 *
 * @export
 * @async
 * @param {string} path
 * @param {string} fileName
 * @returns {*}
 */
export async function zipToTs(path: string, fileName: string) {
  const version = await getUiVersion(join(path, `spa\\index.html`));

  const binPath = join(path, `${fileName}.zip`);
  const uint = await Deno.readFile(binPath);

  let binary = "";
  const len = uint.length;

  for (let index = 0; index < len; index++) {
    binary += String.fromCharCode(uint[index]);
  }

  const binBase64 = btoa(binary);
  const base64 = trunString(binBase64, 100);

  const tsFileContent = `export const version='${version}';

export const bin=\`${base64}\``;
  const tsFilePath = join("./wwwzip", `${fileName}.ts`);
  await Deno.writeTextFile(tsFilePath, tsFileContent);
  await Deno.remove(binPath);
}

/**
 * This function converts the ts base64 file to .zip file
 * The zip file will be wwwroot
 * example: C:\Users\USERNAME\AppData\Local\deno\denoman\wwwroot
 * @date 2/3/2024 - 6:09:39 PM
 *
 * @export
 * @async
 * @param {string} wwwRoot
 * @returns {Promise<string>}
 */
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

async function getUiVersion(indexFile: string): Promise<string> {
  const content = await Deno.readTextFile(indexFile);
  const regEx = /content="DenoMan\s(.*?)">/gm;
  const matches = content.matchAll(regEx);
  let version = "0";
  for (const m of matches) {
    version = m[1];
  }
  return version;
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
