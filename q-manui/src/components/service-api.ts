import { api } from 'boot/axios'
import {
  ControlAction,
  DependenciesModel,
  DeviceModel,
  PerfmonModel,
  ProcessModel,
  ServiceModel,
  ShellResponse,
  SystemModel,
  UserModel,
  GroupModel,
  WinRMPayload,
} from './models';

/**
 * Retrieves services from the API based on the provided parameters.
 *
 * @param params - The parameters to be sent with the API request.
 * @returns A promise that resolves to an array of ServiceModel objects if the request is successful, otherwise undefined.
 */
export async function getServices(params: WinRMPayload): Promise<ServiceModel[] | undefined> {
  try {
    const res = await api.get('http://localhost:8001/api/service', { params });
    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    console.log(err);
  }
  return undefined;
}

/**
 * Retrieves the dependencies based on the provided parameters.
 *
 * @param params - The payload containing the parameters for the request.
 * @returns A promise that resolves to an array of `DependenciesModel` or `undefined`.
 */
export async function getDependencies(params: WinRMPayload): Promise<
  DependenciesModel[] | undefined
> {
  try {
    const res = await api.get('http://localhost:8001/api/dependencies', {
      params,
    });
    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    console.log(err);
  }
  return undefined;
}

/**
 * Controls a service by sending an API request to the server.
 * @param params - The payload to be sent with the API request.
 * @param action - The control action to be performed on the service.
 * @param name - The name of the service.
 * @returns A Promise that resolves to a ServiceModel object if the API request is successful, otherwise undefined.
 */
export async function controlService(
  params: WinRMPayload,
  action: ControlAction,
  name: string
): Promise<ServiceModel | undefined> {
  try {
    const res = await api.post(
      'http://localhost:8001/api/service',
      {
        action: action,
        serviceName: name,
      },
      { params }
    );
    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    console.log(err);
  }
  return undefined;
}

/**
 * Retrieves system information using the specified WinRMPayload.
 * @param params - The WinRMPayload object containing the necessary parameters.
 * @returns A Promise that resolves to a SystemModel object representing the system information.
 */
export async function getSystemInformation(params: WinRMPayload): Promise<SystemModel> {
  const res = await api.get('http://localhost:8001/api/system', { params });
  return res.data as SystemModel;
}

/**
 * Retrieves performance monitor data using the specified WinRMPayload.
 * @param params - The WinRMPayload object containing the parameters for the request.
 * @returns A Promise that resolves to a PerfmonModel object representing the performance monitor data.
 */
export async function getPerfmon(params: WinRMPayload): Promise<PerfmonModel> {
  const res = await api.get('http://localhost:8001/api/perfmon', { params });
  return res.data as PerfmonModel;
}

/**
 * Retrieves a list of processes based on the provided parameters.
 *
 * @param params - The payload containing the parameters for the request.
 * @returns A promise that resolves to an array of ProcessModel objects.
 */
export async function getProcesses(params: WinRMPayload): Promise<ProcessModel[]> {
  const res = await api.get('http://localhost:8001/api/process', { params });
  return res.data as ProcessModel[];
}

/**
 * Executes a command on the server using WinRM.
 * @param params - The WinRM payload.
 * @param command - The command to execute.
 * @param isPowerShell - Indicates whether the command is a PowerShell command.
 * @returns A promise that resolves to the response from the server.
 */
export async function execCommand(params: WinRMPayload, command: string, isPowerShell: boolean): Promise<ShellResponse> {
  const res = await api.post('http://localhost:8001/api/command', { command, isPowerShell }, { params });
  return res.data as ShellResponse;
}

/**
 * Retrieves a list of devices based on the provided parameters.
 * @param params - The payload containing the parameters for the request.
 * @returns A promise that resolves to an array of DeviceModel objects.
 */
export async function getDevices(params: WinRMPayload): Promise<DeviceModel[]> {
  const res = await api.get('http://localhost:8001/api/device', { params });
  return res.data as DeviceModel[];
}

/**
 * Retrieves a list of users from the API.
 *
 * @param params - The parameters for the API request.
 * @returns A promise that resolves to an array of UserModel objects.
 */
export async function getUsers(params: WinRMPayload): Promise<UserModel[]> {
  const res = await api.get('http://localhost:8001/api/users', { params });
  return res.data as UserModel[];
}

/**
 * Retrieves groups using the specified parameters.
 *
 * @param params - The parameters for the WinRMPayload.
 * @returns A promise that resolves to an array of GroupModel objects.
 */
export async function getGroups(params: WinRMPayload): Promise<GroupModel[]> {
  const res = await api.get('http://localhost:8001/api/groups', { params });
  return res.data as GroupModel[];
}

/**
 * Sends a request to the server to exit the application.
 */
export function exitApp() {
  api.get('http://localhost:8001/api/exit').catch(() => {
  });
}
