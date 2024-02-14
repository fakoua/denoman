import * as winrm from "https://deno.land/x/deno_winrm@0.6/mod.ts";
import { getWmiValue } from "./wmiutils.ts";
import {
  DiskModel,
  NetworkModel,
  PerfmonModel,
  SystemModel,
  WinRMPayload,
} from "./models.ts";

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

export async function getPerfmon(payload: WinRMPayload): Promise<PerfmonModel> {
  const query =
    "Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select Average, Count | Format-Custom";

  const queryMemory = `$CompObject =  Get-WmiObject -Class WIN32_OperatingSystem
    $TotalMemory = $CompObject.TotalVisibleMemorySize
    $FreeMemory = $CompObject.FreePhysicalMemory
     Write-Host $TotalMemory,"|",$FreeMemory`;

  const queryDisk =
    `Get-WmiObject -Query "SELECT PercentDiskTime, DiskReadBytesPersec ,DiskWriteBytesPersec, Name FROM Win32_PerfFormattedData_PerfDisk_PhysicalDisk Where Name!='_Total'" | Format-Custom`;

  const queryNetwork =
    `$nic = (Get-WMIObject -Query "SELECT Name FROM Win32_NetworkAdapter WHERE NetEnabled = 'true'").Name
    Get-WMIObject -Query "SELECT Name, BytesReceivedPersec, BytesSentPersec, BytesTotalPersec FROM Win32_PerfFormattedData_Tcpip_NetworkInterface Where Name = '$nic'" | Format-Custom`;

  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const res = await context.runPowerShell(query);
  const perf = process_PerfMon_Wmi(res.stdout);
  const resMemory = await context.runPowerShell(queryMemory);
  const memory = resMemory.stdout.split("|");
  const totalMemory = parseInt(memory[0]);
  const freeMemory = parseInt(memory[1]);

  const resDisk = await context.runPowerShell(queryDisk);
  const disks = process_Disk_Wmi(resDisk.stdout);

  const resNetwork = await context.runPowerShell(queryNetwork);
  const network = process_Network_Wmi(resNetwork.stdout);

  return {
    cpu: parseInt(perf),
    memory: {
      totalMemory: totalMemory,
      freeMemory: freeMemory,
    },
    disks: disks,
    networks: network,
  };
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

function getRootMatches(wmi: string): IterableIterator<RegExpMatchArray> {
  const regexRoot = /\{([^{}]+)\}.?/gims; // match withing class ManagementObject { ... }
  wmi = wmi.replaceAll("\\", "|");
  const matches = wmi.matchAll(regexRoot);
  return matches;
}

function process_OperatingSystem_Wmi(wmi: string): SystemModel {
  const matches = getRootMatches(wmi);
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
  const matches = getRootMatches(wmi);
  const rtnVal: string[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const processorName = getWmiValue<string>("Name", "Caption", mt);
    rtnVal.push(processorName);
  }

  return rtnVal[0];
}

function process_PerfMon_Wmi(wmi: string): string {
  const matches = getRootMatches(wmi);
  const rtnVal: string[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const average = getWmiValue<string>("Average", "Count", mt);
    rtnVal.push(average);
  }
  return rtnVal[0];
}

function process_Network_Wmi(wmi: string): NetworkModel {
  const matches = getRootMatches(wmi);
  const rtnVal: NetworkModel[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const BytesReceivedPersec = getWmiValue<string>(
      "BytesReceivedPersec",
      "BytesSentPersec",
      mt,
    );
    const BytesSentPersec = getWmiValue<string>(
      "BytesSentPersec",
      "BytesTotalPersec",
      mt,
    );
    const BytesTotalPersec = getWmiValue<string>(
      "BytesTotalPersec",
      "Name",
      mt,
    );
    const Name = getWmiValue<string>("Name", "PSComputerName", mt);
    rtnVal.push({
      bytesReceivedPersec: parseInt(BytesReceivedPersec),
      bytesSentPersec: parseInt(BytesSentPersec),
      bytesTotalPersec: parseInt(BytesTotalPersec),
      name: Name,
    });
  }
  return rtnVal[0]; // only one network adapter for now.
}

function process_Disk_Wmi(wmi: string): DiskModel[] {
  const matches = getRootMatches(wmi);
  const rtnVal: DiskModel[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const DiskReadBytesPersec = getWmiValue<string>(
      "DiskReadBytesPersec",
      "DiskWriteBytesPersec",
      mt,
    );
    const DiskWriteBytesPersec = getWmiValue<string>(
      "DiskWriteBytesPersec",
      "Name",
      mt,
    );
    const Name = getWmiValue<string>("Name", "PercentDiskTime", mt);
    const PercentDiskTime = getWmiValue<string>(
      "PercentDiskTime",
      "PSComputerName",
      mt,
    );
    rtnVal.push({
      diskReadBytesPersec: parseInt(DiskReadBytesPersec),
      diskWriteBytesPersec: parseInt(DiskWriteBytesPersec),
      name: Name,
      percentDiskTime: parseInt(PercentDiskTime),
    });
  }
  return rtnVal;
}
