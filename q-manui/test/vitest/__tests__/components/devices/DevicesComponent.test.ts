import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';

import DevicesComponent from '../../../../../src/components/devices/DevicesComponent.vue';
import { nextTick } from 'vue';

installQuasarPlugin({ plugins: { Notify } });

vi.mock('axios', () => ({
  default: ({
    create: () => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      },
      get: vi.fn((route) => {
        return Promise.resolve({ route: route, data: [] })
      }),
      post: vi.fn((route, data) => {
        return Promise.resolve({ route: route, data: data })
      }),
      put: vi.fn((route, data) => {
        return Promise.resolve({ route: route, data: data })
      }),
      delete: vi.fn((route) => {
        return Promise.resolve({ route: route, data: [] })
      })
    })
  })
}))

describe('devices component', () => {
  it('should load', async () => {
    expect(DevicesComponent).toBeTruthy();
    const wrapper = mount(DevicesComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeA',
          port: 22,
          protocol: 'http',
        }
      },
    });
    expect(wrapper.html()).toContain('div')
  });

  it('should constains device manager', async () => {
    expect(DevicesComponent).toBeTruthy();
    const wrapper = mount(DevicesComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeB',
          port: 22,
          protocol: 'http',
        }
      },
    });
    wrapper.vm.isLoading = false;
    await nextTick()
    expect(wrapper.html()).toContain('Device Manager')
  });
});
