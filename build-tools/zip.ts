import { join } from "https://deno.land/std@0.133.0/path/mod.ts";

export const compress = async (
  files: string | string[],
  archiveName = "./archive.zip",
  options?: CompressOptions,
): Promise<number> => {
  return await compressProcess(files, archiveName, options);
};

const compressProcess = async (
  files: string | string[],
  archiveName = "./archive.zip",
  options?: CompressOptions,
): Promise<number> => {
  const filesList = typeof files === "string"
    ? files
    : files.join(Deno.build.os === "windows" ? ", " : " ");

  const p = new Deno.Command("PowerShell", {
    args: [
      "Compress-Archive",
      "-Path",
      filesList,
      "-DestinationPath",
      archiveName,
      options?.overwrite ? "-Force" : "",
    ],
    stderr: "piped",
    stdout: "piped",
  });

  const { code } = await p.spawn().status;
  return code;
};

export const decompress = async (
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
  return await decompressProcess(filePath, fullDestinationPath, options) === 0
    ? fullDestinationPath
    : false;
};
const decompressProcess = async (
  zipSourcePath: string,
  destinationPath: string,
  options?: DecompressOptions,
): Promise<number> => {
  const p = new Deno.Command("PowerShell", {
    args: [
      "Expand-Archive",
      "-Path",
      `"${zipSourcePath}"`,
      "-DestinationPath",
      `"${destinationPath}"`,
      options?.overwrite ? "-Force" : "",
    ],
    stderr: "piped",
    stdout: "piped",
  });

  const { code } = await p.spawn().status;
  return code;
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
