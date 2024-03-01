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
  WinRMPayload,
} from './models';

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

export async function getSystemInformation(params: WinRMPayload): Promise<SystemModel> {
  const res = await api.get('http://localhost:8001/api/system', { params });
  return res.data as SystemModel;
}

export async function getPerfmon(params: WinRMPayload): Promise<PerfmonModel> {
  const res = await api.get('http://localhost:8001/api/perfmon', { params });
  return res.data as PerfmonModel;
}

export async function getProcesses(params: WinRMPayload): Promise<ProcessModel[]> {
  const res = await api.get('http://localhost:8001/api/process', { params });
  return res.data as ProcessModel[];
}

export async function execCommand(params: WinRMPayload, command: string, isPowerShell: boolean): Promise<ShellResponse> {
  const res = await api.post('http://localhost:8001/api/command', { command, isPowerShell }, { params });
  return res.data as ShellResponse;
}

export async function getDevices(params: WinRMPayload): Promise<DeviceModel[]> {
  const res = await api.get('http://localhost:8001/api/device', { params });
  return res.data as DeviceModel[];
}

export function exitApp() {
  api.get('http://localhost:8001/api/exit').catch(() => {
  });
}
