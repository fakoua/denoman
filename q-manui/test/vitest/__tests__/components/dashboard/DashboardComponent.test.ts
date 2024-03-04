import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';

import DashboardComponent from 'src/components/dashboard/DashboardComponent.vue';
import { nextTick } from 'vue';

installQuasarPlugin({ plugins: { Notify } });

const services = [
  {
    acceptPause: false,
    acceptStop: true,
    caption: 'Adobe Acrobat Update Service',
    delayedAutoStart: false,
    description: 'Adobe Acrobat Updater keeps your Adobe software up to date.',
    desktopInteract: false,
    displayName: 'Adobe Acrobat Update Service',
    errorControl: 'Ignore',
    exitCode: '0',
    isSystemDriver: false,
    name: 'AdobeARMservice',
    pathName: '"C:|Program Files (x86)|Common Files|Adobe|ARM|1.0|armsvc.exe"',
    processId: '28976',
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
    exitCode: '0',
    isSystemDriver: false,
    name: 'AdobeARMservice',
    pathName: 'c:',
    processId: '10',
    serviceType: 'Own Process',
    startMode: 'Auto',
    startName: '',
    started: false,
    state: 'Stopped',
    status: 'Unknown',
  },
];

const deps = [
  { antecedent: 'RpcSs', dependent: 'AppIDSvc' },
  { antecedent: 'AppID', dependent: 'AppIDSvc' },
  { antecedent: 'CryptSvc', dependent: 'AppIDSvc' },
  { antecedent: 'RpcSs', dependent: 'Appinfo' },
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
          return Promise.resolve({ route: route, data: services, status: 200 });
        }
        if (route.endsWith('/dependencies')) {
          return Promise.resolve({ route: route, data: deps, status: 200 });
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

describe('dashboard component', () => {
  it('should load [loading]', async () => {
    expect(DashboardComponent).toBeTruthy();
    const wrapper = mount(DashboardComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fake5',
          port: 22,
          protocol: 'http',
        },
      },
    });
    expect(wrapper.html()).toContain('full-width row justify-between');
  });

  it('should load with data', async () => {
    expect(DashboardComponent).toBeTruthy();
    const wrapper = mount(DashboardComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fake6',
          port: 22,
          protocol: 'http',
        },
      },
    });

    await flushPromises();
    await nextTick();
    expect(wrapper.html()).toContain(
      'class="q-item__label card-value">2</div>',
    );
    expect(wrapper.html()).toContain('Running services');
  });
});
