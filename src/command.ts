import * as winrm from "https://deno.land/x/deno_winrm@0.6/mod.ts";

import { WinRMPayload } from "./models.ts";
import { ShellResponse } from "https://deno.land/x/deno_winrm@0.6/src/common.ts";

export async function executeCommand(
  payload: WinRMPayload,
  command: string,
  isPowerShell: boolean,
): Promise<ShellResponse> {
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  if (isPowerShell) {
    const res = await context.runPowerShell(command);
    return res;
  }
  const res = await context.runCommand(command);
  return res;
}
