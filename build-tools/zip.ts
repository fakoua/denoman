import { compress, decompress } from "https://deno.land/x/zip@v1.2.5/mod.ts";

import { join } from "https://deno.land/std@0.218.2/path/mod.ts";

export const zipCompress = async (
  files: string | string[],
  archiveName = "./archive.zip",
  options?: CompressOptions,
): Promise<boolean> => {
  return await compress(files, archiveName, options);
};
export const zipDecompress = async (
  filePath: string,
  destinationPath: string | null = "./",
  options?: DecompressOptions,
): Promise<string | false> => {
  // check destinationPath is not null and set './' as destinationPath
  if (!destinationPath) {
    destinationPath = "./";
  }

  // the file name with aut extension
  const fileNameWithOutExt = getFileNameFromPath(filePath);
  // get the extract file and add fileNameWithOutExt whene options.includeFileName is true
  const fullDestinationPath = options?.includeFileName
    ? join(destinationPath, fileNameWithOutExt)
    : destinationPath;

  // return the unzipped file path or false whene the unzipping Process failed
  return await decompress(filePath, fullDestinationPath, options) === false
    ? false
    : fullDestinationPath;
};
interface CompressOptions {
  overwrite?: boolean;
  flags: string[];
}

interface DecompressOptions {
  overwrite?: boolean;
  includeFileName?: boolean;
}

function getFileNameFromPath(filePath: string) {
  return filePath.split("/").at(-1)?.split(".").slice(0, -1).join(".") || "";
}
