import * as winrm from "https://deno.land/x/deno_winrm@0.6/mod.ts";
import { delay } from "https://deno.land/std@0.213.0/async/delay.ts";
import { DependenciesModel, ServiceModel, WinRMPayload } from "./models.ts";
import { getWmiValue } from "./wmiutils.ts";

/**
 * Retrieves the list of services from a remote machine using WinRM.
 * @param payload The WinRM payload containing the necessary credentials and connection details.
 * @returns A promise that resolves to an array of ServiceModel objects representing the services.
 */
export async function getServices(
  payload: WinRMPayload,
): Promise<Array<ServiceModel>> {
  const query =
    "Get-WmiObject win32_service | select AcceptPause, AcceptStop, Caption, DelayedAutoStart, Description, DesktopInteract, DisplayName, ErrorControl, ExitCode, Name, ProcessId, ServiceType, Started, StartMode, StartName, State, Status, PathName, InstallDate | Format-Custom -Depth 1";
  const query_SystemDriver =
    "Get-WmiObject Win32_SystemDriver | select AcceptPause, AcceptStop, Caption, DelayedAutoStart, Description, DesktopInteract, DisplayName, ErrorControl, ExitCode, Name, ProcessId, ServiceType, Started, StartMode, StartName, State, Status, PathName, InstallDate | Format-Custom -Depth 1";
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    { hostname: payload.host, port: payload.port, protocol: payload.protocol },
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

/**
 * Retrieves the dependent services of a given WinRMPayload.
 * @param payload The WinRMPayload containing the necessary information for the query.
 * @returns A Promise that resolves to an array of DependenciesModel representing the dependent services.
 */
export async function getDependsServices(
  payload: WinRMPayload,
): Promise<Array<DependenciesModel>> {
  const query =
    "Get-CimInstance -ClassName Win32_DependentService | Select-Object -Property Antecedent, Dependent | Format-List";
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    { hostname: payload.host, port: payload.port, protocol: payload.protocol },
  );

  const res = await context.runPowerShell(query);
  if (res.exitCode !== 0) {
    console.log(res);
    return [];
  }
  return processDependsWmi(res.stdout);
}

/**
 * Executes an action on a service.
 * @param serviceName - The name of the service.
 * @param action - The action to perform on the service. Can be "Start", "Stop", "Suspend", "Resume", or "Restart".
 * @param payload - The payload containing the necessary information for the action.
 * @returns A Promise that resolves to the updated ServiceModel if the action is successful, otherwise undefined.
 */
export async function actions(
  serviceName: string,
  action: "Start" | "Stop" | "Suspend" | "Resume" | "Restart",
  payload: WinRMPayload,
): Promise<ServiceModel | undefined> {
  const command = `${action}-Service -Name ${serviceName}`;
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    { hostname: payload.host, port: payload.port, protocol: payload.protocol },
  );

  const res = await context.runPowerShell(command);
  if (res.exitCode !== 0) {
    console.log(res);
    return undefined;
  }
  if (res.error === undefined && res.exitCode === 0) {
    //wait 5 sec
    await delay(5000);
    const service = await getService(serviceName, payload);
    return service;
  }
  return undefined;
}

/**
 * Retrieves information about a service.
 * @param name - The name of the service.
 * @param payload - The payload containing the WinRM credentials and connection details.
 * @returns A Promise that resolves to a ServiceModel object representing the service, or undefined if the service is not found.
 */
export async function getService(
  name: string,
  payload: WinRMPayload,
): Promise<ServiceModel | undefined> {
  const query =
    `Get-WmiObject win32_service -Filter "Name='${name}'" | select AcceptPause, AcceptStop, Caption, DelayedAutoStart, Description, DesktopInteract, DisplayName, ErrorControl, ExitCode, Name, ProcessId, ServiceType, Started, StartMode, StartName, State, Status, PathName, InstallDate | Format-Custom -Depth 1`;
  const context = new winrm.WinRMContext(
    { username: payload.username, password: payload.password },
    { hostname: payload.host, port: payload.port, protocol: payload.protocol },
  );
  const res = await context.runPowerShell(query);

  if (res.exitCode !== 0) {
    console.log(res);
    return undefined;
  }

  if (res.exitCode === 0 && res.stdout.length > 10) {
    const regularServices = processWmi(res.stdout, false);
    return regularServices[0];
  }
  return undefined;
}

/**
 * Processes the WMI string and extracts the dependencies using regular expressions.
 * @param wmi The WMI string to process.
 * @returns An array of DependenciesModel objects containing the antecedent and dependent values.
 */
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

/**
 * Processes the WMI data and returns an array of ServiceModel objects.
 *
 * @param wmi - The WMI data to process.
 * @param isSystemDriver - Indicates whether the service is a system driver.
 * @returns An array of ServiceModel objects.
 */
function processWmi(wmi: string, isSystemDriver: boolean): ServiceModel[] {
  wmi = wmi.replaceAll("\\", "|");
  const regex = /\{(.*?)\}.?/gims; // match withing class ManagementObject { ... }
  const matches = wmi.matchAll(regex);
  const rtnVal: ServiceModel[] = [];

  for (const match of matches) {
    const mt = `  ${match[1]}`;
    const service: ServiceModel = {
      acceptPause: getWmiValue<boolean>("AcceptPause", "AcceptStop", mt),
      acceptStop: getWmiValue<boolean>("AcceptStop", "Caption", mt),
      caption: getWmiValue<string>("Caption", "DelayedAutoStart", mt),
      delayedAutoStart: getWmiValue<boolean>(
        "DelayedAutoStart",
        "Description",
        mt,
      ),
      description: getWmiValue<string>("Description", "DesktopInteract", mt),
      desktopInteract: getWmiValue<boolean>(
        "DesktopInteract",
        "DisplayName",
        mt,
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
