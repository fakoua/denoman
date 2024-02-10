import * as winrm from "https://deno.land/x/deno_winrm@0.6/mod.ts";
import { getWmiValue } from "./wmiutils.ts";
import { SystemModel, WinRMPayload } from "./models.ts";

/**
 * Retrieves system information using WinRM.
 * @param payload - The WinRM payload containing the necessary credentials and connection details.
 * @returns A Promise that resolves to a SystemModel object representing the system information.
 */
export async function getSystem(payload: WinRMPayload): Promise<SystemModel> {
  const query_Win32_OperatingSystem =
    "Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object -Property Caption, CSName, OSArchitecture, SystemDrive| Format-Custom -Depth 1";
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const res = await context.runPowerShell(query_Win32_OperatingSystem);

  const info = process_OperatingSystem_Wmi(res.stdout);
  info.processorName = await getProcessorName(payload);
  info.memory = await getMemory(payload);
  info.memory = `${info.memory} GB`;
  return info;
}

async function getProcessorName(payload: WinRMPayload): Promise<string> {
  const query =
    "Get-CimInstance -ClassName Win32_Processor | Select-Object -Property Name, Caption| Format-Custom -Depth 1";
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const res = await context.runPowerShell(query);

  return process_Win32_Processor_Wmi(res.stdout);
}

async function getMemory(payload: WinRMPayload): Promise<string> {
  const query =
    `Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property capacity -Sum | Foreach {"{0}" -f ([math]::round(($_.Sum / 1GB),2))}`;
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const res = await context.runPowerShell(query);
  return res.stdout;
}

function process_OperatingSystem_Wmi(wmi: string): SystemModel {
  wmi = wmi.replaceAll("\\", "|");
  const regex = /\{(.*?)\}.?/gims; // match withing class ManagementObject { ... }
  const matches = wmi.matchAll(regex);
  const rtnVal: SystemModel[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const info: SystemModel = {
      caption: getWmiValue<string>("Caption", "CSName", mt),
      csName: getWmiValue<string>("CSName", "OSArchitecture", mt),
      osArchitecture: getWmiValue<string>("OSArchitecture", "SystemDrive", mt),
      processorName: "",
      memory: "",
    };
    rtnVal.push(info);
  }

  return rtnVal[0];
}

function process_Win32_Processor_Wmi(wmi: string): string {
  wmi = wmi.replaceAll("\\", "|");
  const regex = /\{(.*?)\}.?/gims; // match withing class ManagementObject { ... }
  const matches = wmi.matchAll(regex);
  const rtnVal: string[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const processorName = getWmiValue<string>("Name", "Caption", mt);
    rtnVal.push(processorName);
  }

  return rtnVal[0];
}
