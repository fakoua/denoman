import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';

import ServerComponent from 'src/components/ServerComponent.vue';
import { ServiceModel } from 'src/components/models';

installQuasarPlugin({ plugins: { Notify } });

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
    caption: 'caption',
    delayedAutoStart: false,
    description: 'des',
    desktopInteract: false,
    displayName: 'Adobe Acrobat Update Service',
    errorControl: 'Ignore',
    exitCode: 0,
    isSystemDriver: false,
    name: 'AdobeARMservice',
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

vi.mock('axios', () => ({
  default: {
    create: () => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn((route) => {
        return Promise.resolve({ route: route, data: services });
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

describe('server component', () => {
  it('should load [loading]', async () => {
    expect(ServerComponent).toBeTruthy();
    const wrapper = mount(ServerComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeXX',
          port: 22,
          protocol: 'http',
        },
      },
    });
    expect(wrapper.html()).toContain('container fit row wrap justify-start items-start content-start');
  });
});
