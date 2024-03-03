import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';

import PerfmonComponent from '../../../../../src/components/performance/PerfmonComponent.vue';
import { nextTick } from 'vue';
import { PerfmonModel, SystemModel } from 'src/components/models';

installQuasarPlugin({ plugins: { Notify } });

const perfmonData: PerfmonModel = {
  cpu: 14,
  disks: [
    {
      diskReadBytesPersec: 0,
      diskWriteBytesPersec: 0,
      name: 'C:',
      percentDiskTime: 10,
    },
  ],
  memory: {
    freeMemory: 890504,
    totalMemory: 4096,
  },
  networks:
    {
      bytesReceivedPersec: 0,
      bytesSentPersec: 0,
      bytesTotalPersec: 0,
      name: 'Ethernet',
    },
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
        if (route.endsWith('/perfmon')) {
          return Promise.resolve(
            {
              status: 200,
              data: perfmonData,
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

describe('perfmon component', () => {
  it('should load [loading]', async () => {
    expect(PerfmonComponent).toBeTruthy();
    const wrapper = mount(PerfmonComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeC',
          port: 22,
          protocol: 'http',
        },
      },
    });

    await flushPromises();
    await nextTick();
    expect(wrapper.html()).toContain('CPU Usage %');
  });
});
