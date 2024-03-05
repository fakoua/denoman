import * as winrm from "@fakoua/winrm";
import { getWmiValue } from "./wmiutils.ts";
import {
  DeviceModel,
  DiskModel,
  GroupModel,
  NetworkModel,
  PerfmonModel,
  SystemModel,
  UserGroups,
  UserModel,
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

/**
 * Retrieves performance monitoring data for the specified WinRM payload.
 * @param payload The WinRM payload containing the necessary credentials and connection details.
 * @returns A Promise that resolves to a PerfmonModel object containing the performance data.
 */
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

/**
 * Retrieves a list of devices using WinRM.
 *
 * @param payload - The WinRM payload containing the necessary credentials and connection details.
 * @returns A promise that resolves to an array of DeviceModel objects representing the devices.
 */
export async function getDevices(
  payload: WinRMPayload,
): Promise<DeviceModel[]> {
  const query =
    `Get-PnpDevice | Select-Object -Property Caption, Description, Status, Manufacturer, Class, Problem | Format-Custom`;
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const res = await context.runPowerShell(query);
  if (res.exitCode !== 0) {
    console.log(res);
    return [];
  }
  return processWmiDevice(res.stdout);
}

/**
 * Retrieves a list of user models from the WinRM server.
 * @param payload - The WinRMPayload object containing the necessary information for authentication and connection.
 * @returns A Promise that resolves to an array of UserModel objects.
 */
export async function getUsers(payload: WinRMPayload): Promise<UserModel[]> {
  const query =
    `Get-LocalUser | Select-Object -Property Description, Enabled, FullName, UserMayChangePassword, PasswordRequired, Name, @{Name="PasswordChangeableDate";Expression={$_.PasswordChangeableDate.ToString("yyyy-MM-dd HH:mm:ss")}}, @{Name="PasswordLastSet";Expression={$_.PasswordLastSet.ToString("yyyy-MM-dd HH:mm:ss")}}, @{Name="LastLogon";Expression={$_.LastLogon.ToString("yyyy-MM-dd HH:mm:ss")}}, @{Name="PasswordExpires";Expression={$_.PasswordExpires.ToString("yyyy-MM-dd HH:mm:ss")}}, PrincipalSource | Format-Custom`;
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const res = await context.runPowerShell(query);
  if (res.exitCode !== 0) {
    return [];
  }
  const users = processWmiUser(res.stdout);

  const userGroups = await getUsersAndGroups(payload);

  for (const user of users) {
    const userGroup = userGroups.find((u) => u.user === user.name);
    if (userGroup) {
      user.groups = userGroup.groups;
    }
  }

  return users;
}

/**
 * Retrieves the list of users and their associated groups using WinRM.
 *
 * @param payload - The WinRMPayload object containing the necessary credentials and connection details.
 * @returns A Promise that resolves to an array of UserGroups objects representing the users and their groups.
 */
export async function getUsersAndGroups(
  payload: WinRMPayload,
): Promise<UserGroups[]> {
  const query = `Get-LocalUser | 
  ForEach-Object { 
      $user = $_
      return [PSCustomObject]@{ 
          "User"   = $user.Name
          "Groups" = Get-LocalGroup | Where-Object {  $user.SID -in ($_ | Get-LocalGroupMember | Select-Object -ExpandProperty "SID") } | Select-Object -ExpandProperty "Name"
      } 
  } | Format-List`;

  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const res = await context.runPowerShell(query);
  if (res.exitCode !== 0) {
    return [];
  }
  return parseUserGroups(res.stdout);
}

/**
 * Retrieves a list of groups from the WinRM server.
 * @param payload - The WinRM payload containing the necessary information for authentication and connection.
 * @returns A promise that resolves to an array of GroupModel objects representing the groups retrieved from the server.
 */
export async function getGroups(payload: WinRMPayload): Promise<GroupModel[]> {
  const query =
    `Get-LocalGroup | Select-Object -Property Name, Description, PrincipalSource | Format-Custom`;
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    {
      hostname: payload.hostname,
      port: payload.port,
      protocol: payload.protocol,
    },
  );
  const res = await context.runPowerShell(query);
  if (res.exitCode !== 0) {
    return [];
  }
  const groups = processWmiGroup(res.stdout);
  const userGroups = await getUsersAndGroups(payload);

  for (const group of groups) {
    const users = userGroups.filter((u) => u.groups.includes(group.name));
    group.members = users.map((u) => u.user);
  }
  return groups;
}

function parseUserGroups(input: string): UserGroups[] {
  const userRegex = /User\s+:\s+(.*)/;
  const groupsRegex = /Groups\s+:\s+(.*)/;

  const usersAndGroups: UserGroups[] = [];
  let currentUser: UserGroups | null = null;

  input.split("\n").forEach((line) => {
    const userMatch = userRegex.exec(line);
    const groupsMatch = groupsRegex.exec(line);

    if (userMatch) {
      if (currentUser) usersAndGroups.push(currentUser);
      const user = userMatch[1].trim();
      currentUser = { user, groups: [] };
    } else if (groupsMatch && currentUser) {
      const groups = groupsMatch[1].split(",").map((group) =>
        group.trim().replace("{", "").replace("}", "")
      );
      currentUser.groups = groups;
    }
  });

  if (currentUser) usersAndGroups.push(currentUser);

  return usersAndGroups;
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

function processWmiDevice(wmi: string): DeviceModel[] {
  wmi = wmi.replaceAll("\\", "|");
  wmi = wmi.replaceAll("\r\n\r\n", "\r\n");
  const regex = /\{([^{}]+)\}.?/gims; // match withing class ManagementObject { ... }
  const matches = wmi.matchAll(regex);
  const rtnVal: DeviceModel[] = [];

  let idCounter = 1;
  for (const match of matches) {
    const mt = `  ${match[1]}`;
    //I'm using parseInt and parseFloat to convert the values to the correct type (unknown at compile time)
    const cls: string = getWmiValue<string>("Class", "Problem", mt);
    const process: DeviceModel = {
      caption: getWmiValue<string>("Caption", "Description", mt),
      description: getWmiValue<string>("Description", "Status", mt),
      status: getWmiValue<string>("Status", "Manufacturer", mt),
      manufacturer: getWmiValue<string>("Manufacturer", "Class", mt),
      class: cls === "" ? "Other devices" : cls,
      id: idCounter++,
    };
    rtnVal.push(process);
  }

  return rtnVal;
}

function processWmiUser(wmi: string): UserModel[] {
  wmi = wmi.replaceAll("\\", "|");
  wmi = wmi.replaceAll("\r\n\r\n", "\r\n");
  const regex = /\{([^{}]+)\}.?/gims; // match withing class ManagementObject { ... }
  const matches = wmi.matchAll(regex);
  const rtnVal: UserModel[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    //I'm using parseInt and parseFloat to convert the values to the correct type (unknown at compile time)
    const user: UserModel = {
      description: getWmiValue<string>("Description", "Enabled", mt),
      enabled: getWmiValue<boolean>("Enabled", "FullName", mt),
      fullName: getWmiValue<string>("FullName", "UserMayChangePassword", mt),
      userMayChangePassword: getWmiValue<boolean>(
        "UserMayChangePassword",
        "PasswordRequired",
        mt,
      ),
      passwordRequired: getWmiValue<boolean>("PasswordRequired", "Name", mt),
      name: getWmiValue<string>("Name", "PasswordChangeableDate", mt),
      passwordChangeableDate: getWmiValue<string>(
        "PasswordChangeableDate",
        "PasswordLastSet",
        mt,
      ),
      passwordLastSet: getWmiValue<string>("PasswordLastSet", "LastLogon", mt),
      lastLogon: getWmiValue<string>("LastLogon", "PasswordExpires", mt),
      passwordExpires: getWmiValue<string>(
        "PasswordExpires",
        "PrincipalSource",
        mt,
      ),
    };
    rtnVal.push(user);
  }

  return rtnVal;
}

function processWmiGroup(wmi: string): GroupModel[] {
  wmi = wmi.replaceAll("\\", "|");
  wmi = wmi.replaceAll("\r\n\r\n", "\r\n");
  const regex = /\{([^{}]+)\}.?/gims; // match withing class ManagementObject { ... }
  const matches = wmi.matchAll(regex);
  const rtnVal: GroupModel[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const group: GroupModel = {
      name: getWmiValue<string>("Name", "Description", mt),
      description: getWmiValue<string>("Description", "PrincipalSource", mt),
    };
    rtnVal.push(group);
  }

  return rtnVal;
}
