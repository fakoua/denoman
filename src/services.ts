import * as winrm from "https://deno.land/x/deno_winrm@0.6/mod.ts";
import { delay } from "https://deno.land/std@0.203.0/async/delay.ts";
import { DependenciesModel, ServiceModel, WinRMPayload } from "./models.ts";
import { getWmiValue } from "./wmiutils.ts";

export async function getServices(payload: WinRMPayload): Promise<Array<ServiceModel>> {
  const query =
    "Get-WmiObject win32_service | select AcceptPause, AcceptStop, Caption, DelayedAutoStart, Description, DesktopInteract, DisplayName, ErrorControl, ExitCode, Name, ProcessId, ServiceType, Started, StartMode, StartName, State, Status, PathName, InstallDate | Format-Custom -Depth 1";
  const query_SystemDriver =
    "Get-WmiObject Win32_SystemDriver | select AcceptPause, AcceptStop, Caption, DelayedAutoStart, Description, DesktopInteract, DisplayName, ErrorControl, ExitCode, Name, ProcessId, ServiceType, Started, StartMode, StartName, State, Status, PathName, InstallDate | Format-Custom -Depth 1";
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    { hostname: payload.host, port: payload.port, protocol: payload.protocol}
  );
  let res = await context.runPowerShell(query);
  if (res.exitCode !== 0) {
    console.log(res);
    return [];
  }
  const regularServices = processWmi(res.stdout, false);

  res = await context.runPowerShell(query_SystemDriver);
  if (res.exitCode !== 0) {
    console.log(res);
    return [];
  }
  const systemDriverServices = processWmi(res.stdout, true);
  return regularServices.concat(systemDriverServices);
}

export async function getDependsServices(payload: WinRMPayload): Promise<Array<DependenciesModel>> {
  const query =
    "Get-CimInstance -ClassName Win32_DependentService | Select-Object -Property Antecedent, Dependent | Format-List";
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    { hostname: payload.host, port: payload.port, protocol: payload.protocol}
  );

  const res = await context.runPowerShell(query);
  if (res.exitCode !== 0) {
    console.log(res);
    return [];
  }
  return processDependsWmi(res.stdout);
}

export async function actions(
  serviceName: string,
  action: "Start" | "Stop" | "Suspend" | "Resume" | "Restart",
  payload: WinRMPayload
): Promise<ServiceModel | undefined> {
  const command = `${action}-Service -Name ${serviceName}`;
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    { hostname: payload.host, port: payload.port, protocol: payload.protocol}
  );

  const res = await context.runPowerShell(command);
  if (res.exitCode !== 0) {
    console.log(res);
    return undefined;
  }
  if (res.error === undefined && res.exitCode === 0) {
    //wait 5 sec
  await delay(5000)
  const service = await getService(serviceName, payload);
  return service;
  }
  return undefined;
}

export async function getService(name: string, payload: WinRMPayload): Promise<ServiceModel | undefined> {
  const query = `Get-WmiObject win32_service -Filter "Name='${name}'" | select AcceptPause, AcceptStop, Caption, DelayedAutoStart, Description, DesktopInteract, DisplayName, ErrorControl, ExitCode, Name, ProcessId, ServiceType, Started, StartMode, StartName, State, Status, PathName, InstallDate | Format-Custom -Depth 1`;
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    { hostname: payload.host, port: payload.port, protocol: payload.protocol}
  );
  const res = await context.runPowerShell(query);

  if (res.exitCode !== 0) {
    console.log(res);
    return undefined;
  }

  if (res.exitCode === 0 && res.stdout.length > 10) {
    const regularServices = processWmi(res.stdout, false);
    return regularServices[0]
  }
  return undefined
}
function processDependsWmi(wmi: string): Array<DependenciesModel> {
  const rtnVal: Array<DependenciesModel> = [];
  const regexAnt = /Antecedent.*\"(.*?)\"/gim; // matches Antecedent : Win32_SystemDriver (Name = "WinVerbs")
  const matchesAnt = wmi.matchAll(regexAnt);
  for (const match of matchesAnt) {
    rtnVal.push({
      antecedent: match[1],
      dependent: "",
    });
  }

  const regexDep = /Dependent.*\"(.*?)\"/gim; // matches Dependent : Win32_SystemDriver (Name = "WinVerbs")
  const matchesDep = wmi.matchAll(regexDep);

  let count = 0;
  for (const match of matchesDep) {
    rtnVal[count++].dependent = match[1];
  }
  return rtnVal;
}
function processWmi(wmi: string, isSystemDriver: boolean): Array<ServiceModel> {
  wmi = wmi.replaceAll("\\", "|");
  const regex = /\{(.*?)\}.?/gims; // match withing class ManagementObject { ... }
  const matches = wmi.matchAll(regex);
  const rtnVal: Array<any> = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const service: ServiceModel = {
      acceptPause: getWmiValue<boolean>("AcceptPause", "AcceptStop", mt),
      acceptStop: getWmiValue<boolean>("AcceptStop", "Caption", mt),
      caption: getWmiValue<string>("Caption", "DelayedAutoStart", mt),
      delayedAutoStart: getWmiValue<boolean>(
        "DelayedAutoStart",
        "Description",
        mt
      ),
      description: getWmiValue<string>("Description", "DesktopInteract", mt),
      desktopInteract: getWmiValue<boolean>(
        "DesktopInteract",
        "DisplayName",
        mt
      ),
      displayName: getWmiValue<string>("DisplayName", "ErrorControl", mt),
      errorControl: getWmiValue<string>("ErrorControl", "ExitCode", mt),
      exitCode: getWmiValue<number>("ExitCode", "Name", mt),
      name: getWmiValue<string>("Name", "ProcessId", mt),
      processId: getWmiValue<number>("ProcessId", "ServiceType", mt),
      serviceType: getWmiValue<string>("ServiceType", "Started", mt),
      started: getWmiValue<boolean>("Started", "StartMode", mt),
      startMode: getWmiValue<string>("StartMode", "StartName", mt),
      startName: getWmiValue<string>("StartName", "State", mt),
      state: getWmiValue<string>("State", "Status", mt),
      status: getWmiValue<string>("Status", "PathName", mt),
      pathName: getWmiValue<string>("PathName", "InstallDate", mt),
      isSystemDriver: isSystemDriver,
    };
    rtnVal.push(service);
  }

  return rtnVal;
}
