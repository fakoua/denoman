import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';

import ServiceListComponent from 'src/components/service-window/ServicesListComponent.vue';
import { nextTick } from 'vue';
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

describe('service list component', () => {

  it('should load [after loading]', async () => {
    const wrapper = mount(ServiceListComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeJ',
          port: 22,
          protocol: 'http',
        },
      },
    });

    await flushPromises();
    await nextTick();
    expect(wrapper.html()).not.toContain('1-1 of 1');
  });
});
