import * as winrm from "https://deno.land/x/deno_winrm@0.6/mod.ts";
import { ProcessModel, WinRMPayload } from "./models.ts";
import { getWmiValue } from "./wmiutils.ts";

export async function getProcesses(
  payload: WinRMPayload,
): Promise<ProcessModel[]> {
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const query =
    `Get-Process | Select-Object -Property ProcessName, Id, CPU, WS, VM, @{Name="StartTime";Expression={$_.StartTime.ToString("yyyy-MM-dd HH:mm:ss")}}, @{Name="END";Expression={""}} | Format-Custom -Depth 1`;
  const res = await context.runPowerShell(query);
  if (res.exitCode !== 0) {
    console.log(res);
    return [];
  }
  return processWmi(res.stdout);
}

function processWmi(wmi: string): ProcessModel[] {
  wmi = wmi.replaceAll("\\", "|");
  const regex = /\{([^{}]+)\}.?/gims; // match withing class ManagementObject { ... }
  const matches = wmi.matchAll(regex);
  const rtnVal: ProcessModel[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    //I'm using parseInt and parseFloat to convert the values to the correct type (unknown at compile time)
    const process: ProcessModel = {
      processName: getWmiValue<string>("ProcessName", "Id", mt),
      id: parseInt(getWmiValue<string>("Id", "CPU", mt)),
      cpu: parseFloat(getWmiValue<string>("CPU", "WS", mt)),
      ws: parseInt(getWmiValue<string>("WS", "VM", mt)),
      vm: parseInt(getWmiValue<string>("VM", "StartTime", mt)),
      startTime: getWmiValue<string>("StartTime", "END", mt),
    };
    rtnVal.push(process);
  }

  return rtnVal;
}
