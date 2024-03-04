import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';

import ServiceDetailsComponent from 'src/components/service-window/ServiceDetailsComponent.vue';
import { ServiceModel, SystemModel } from 'src/components/models';
import { nextTick } from 'vue';

installQuasarPlugin({ plugins: { Notify } });

const serviceData: ServiceModel = {
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

const systemData: SystemModel = {
  caption: 'Microsoft Windows 11',
  csName: 'DESKTOP-123',
  osArchitecture: '64-bit',
  processorName: 'Intel(R) Core(TM) i7-7700HQ CPU @ 2.80GHz',
  memory: '8 GB',
};

vi.mock('axios', () => ({
  default: {
    create: () => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn((route) => {
        if (route.endsWith('/api/system')) {
          return Promise.resolve(
            {
              status: 200,
              data: systemData,
            },
          );
        }
        return Promise.resolve({ route: route, data: [] });
      }),
      post: vi.fn((route, data) => {
        return Promise.resolve({ route: route, data: data });
      }),
      put: vi.fn((route, data) => {
        return Promise.resolve({ route: route, data: data });
      }),
      delete: vi.fn((route) => {
        return Promise.resolve({ route: route, data: [] });
      }),
    }),
  },
}));


describe('service details component', () => {
  it('should load [loading]', async () => {
    const wrapper = mount(ServiceDetailsComponent, {
      props: {
        service: serviceData,
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeH',
          port: 22,
          protocol: 'http',
        },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.html()).toContain('Adobe Acrobat Update Service');
  });
});
