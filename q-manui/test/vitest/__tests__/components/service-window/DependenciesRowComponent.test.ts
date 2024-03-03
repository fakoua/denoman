import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';

import DependenciesRowComponent from '../../../../../src/components/service-window/DependenciesRowComponent.vue';
import { nextTick } from 'vue';
import { ServiceModel } from 'src/components/models';

installQuasarPlugin({ plugins: { Notify } });

const service: ServiceModel =
  {
    acceptPause: false,
    acceptStop: true,
    caption: 'Adobe Acrobat Update Service',
    delayedAutoStart: false,
    description: 'Adobe Acrobat Updater keeps your Adobe software up to date.',
    desktopInteract: false,
    displayName: 'Adobe Acrobat Update Service',
    errorControl: 'Ignore',
    exitCode: 0,
    isSystemDriver: false,
    name: 'AdobeARMservice',
    pathName: '"C:|Program Files (x86)|Common Files|Adobe|ARM|1.0|armsvc.exe"',
    processId: 28976,
    serviceType: 'Own Process',
    startMode: 'Auto',
    startName: 'LocalSystem',
    started: true,
    state: 'Running',
    status: 'OK',
  };

  const services: ServiceModel[] = [
    {
      acceptPause: false,
      acceptStop: true,
      caption: 'Adobe Acrobat Update Service',
      delayedAutoStart: false,
      description: 'Adobe Acrobat Updater keeps your Adobe software up to date.',
      desktopInteract: false,
      displayName: 'Adobe Acrobat Update Service',
      errorControl: 'Ignore',
      exitCode: 0,
      isSystemDriver: false,
      name: 'AdobeARMservice',
      pathName: '"C:|Program Files (x86)|Common Files|Adobe|ARM|1.0|armsvc.exe"',
      processId: 28976,
      serviceType: 'Own Process',
      startMode: 'Auto',
      startName: 'LocalSystem',
      started: true,
      state: 'Running',
      status: 'OK',
    },
    {
      acceptPause: false,
      acceptStop: true,
      caption: 'RpcSs',
      delayedAutoStart: false,
      description: 'des',
      desktopInteract: false,
      displayName: 'Adobe Acrobat Update Service',
      errorControl: 'Ignore',
      exitCode: 0,
      isSystemDriver: false,
      name: 'RpcSs',
      pathName: 'c:',
      processId: 10,
      serviceType: 'Own Process',
      startMode: 'Auto',
      startName: '',
      started: false,
      state: 'Stopped',
      status: 'Unknown',
    },
  ];

  const deps = [
    { antecedent: 'AdobeARMservice', dependent: 'AppIDSvc' },
    { antecedent: 'AppID', dependent: 'AppIDSvc' },
    { antecedent: 'CryptSvc', dependent: 'AdobeARMservice' },
    { antecedent: 'RpcSs', dependent: 'AdobeARMservice' },
  ];

vi.mock('axios', () => ({
  default: {
    create: () => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn((route) => {
        if (route.endsWith('/service')) {
          return Promise.resolve({ route: route, data: services, status: 200});
        }
        if (route.endsWith('/dependencies')) {
          return Promise.resolve({ route: route, data: deps, status: 200});
        }
        return Promise.resolve({ route: route, data: [] });
      }),
      post: vi.fn((route) => {
        return Promise.resolve({ route: route, data: [] });
      }),
      put: vi.fn((route) => {
        return Promise.resolve({ route: route, data: [] });
      }),
      delete: vi.fn((route) => {
        return Promise.resolve({ route: route, data: [] });
      }),
    }),
  },
}));

describe('dependency row component', () => {

  it('should load [after loading]', async () => {
    const wrapper = mount(DependenciesRowComponent, {
      props: {
        service: service,
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeF',
          port: 22,
          protocol: 'http',
        },
      },
    });

    await flushPromises();
    await nextTick();
    expect(wrapper.html()).toContain('>RpcSs<');
  });
});
