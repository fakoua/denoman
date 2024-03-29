import * as winrm from "@fakoua/winrm";
import * as logging from "./logging.ts";

import { WinRMPayload } from "./models.ts";
import { ShellResponse } from "@fakoua/winrm/types";

export async function executeCommand(
  payload: WinRMPayload,
  command: string,
  isPowerShell: boolean,
): Promise<ShellResponse> {
  logging.debug(`Executing command '${command}' on ${payload.hostname}`);
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
