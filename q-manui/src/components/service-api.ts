import { api } from 'boot/axios';
import {
  ControlAction,
  DependenciesModel,
  ServiceModel,
  SystemModel,
  WinRMPayload,
} from './models';
import { useHostsStore } from 'src/stores/hosts-store';

export async function getServices(): Promise<ServiceModel[] | undefined> {
  try {
    const params = getPayload();
    const res = await api.get('http://localhost:8001/api/service', { params });
    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    console.log(err);
  }
  return undefined;
}

export async function getDependencies(): Promise<
  DependenciesModel[] | undefined
> {
  const params = getPayload();
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
  action: ControlAction,
  name: string
): Promise<ServiceModel | undefined> {
  const params = getPayload();
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

export async function getSystemInformation(): Promise<SystemModel> {
  const params = getPayload();
  const res = await api.get('http://localhost:8001/api/system', { params });
  return res.data as SystemModel;
}

function getPayload(): WinRMPayload | undefined {
  const store = useHostsStore();

  if (store.$state.length > 0) {
    return store.$state[0];
  }
  return undefined;
}
