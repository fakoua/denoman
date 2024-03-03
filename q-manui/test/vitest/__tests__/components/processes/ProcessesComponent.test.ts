import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';

import ProcessesComponent from '../../../../../src/components/processes/ProcessesComponent.vue';
import { nextTick } from 'vue';
import { ProcessModel } from 'src/components/models';

installQuasarPlugin({ plugins: { Notify } });

const processes: ProcessModel[] = [
  {
    processName: 'test.exe',
    id: 1,
    cpu: 1,
    ws: 1,
    vm: 1,
    startTime: '2021-01-01T00:00:00Z',
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
        return Promise.resolve({ route: route, data: processes });
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

describe('processes component', () => {
  it('should load [loading]', async () => {
    expect(ProcessesComponent).toBeTruthy();
    const wrapper = mount(ProcessesComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeD',
          port: 22,
          protocol: 'http',
        },
      },
    });
    expect(wrapper.html()).toContain('Loading...');
  });

  it('should load [after loading]', async () => {
    const wrapper = mount(ProcessesComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeE',
          port: 22,
          protocol: 'http',
        },
      },
    });

    await flushPromises();
    await nextTick();
    expect(wrapper.html()).not.toContain('No data available');
    expect(wrapper.html()).not.toContain('Loading...');
  });
});
