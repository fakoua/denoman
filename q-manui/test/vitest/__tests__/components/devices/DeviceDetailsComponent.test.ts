import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it } from 'vitest';

import DeviceDetailsComponent from '../../../../../src/components/devices/DeviceDetailsComponent.vue';

installQuasarPlugin({ plugins: { Notify } });

describe('device details component', () => {
  it('should load', async () => {
    expect(DeviceDetailsComponent).toBeTruthy();
    const wrapper = mount(DeviceDetailsComponent, {
      props: {
        device: {
          caption: '--test--',
          description: 'test',
          id: 1,
          status: 'test',
          manufacturer: 'test',
          class: 'test',
        }
      },
    });
    expect(wrapper.html()).toContain('--test--')
  });

  it('should work status OK', async () => {
    expect(DeviceDetailsComponent).toBeTruthy();
    const wrapper = mount(DeviceDetailsComponent, {
      props: {
        device: {
          caption: '--test--',
          description: 'test',
          id: 1,
          status: 'OK',
          manufacturer: 'test',
          class: 'test',
        }
      },
    });
    expect(wrapper.html()).toContain('check')
  });

  it('should work status Unknown', async () => {
    expect(DeviceDetailsComponent).toBeTruthy();
    const wrapper = mount(DeviceDetailsComponent, {
      props: {
        device: {
          caption: '--test--',
          description: 'test',
          id: 1,
          status: 'Unknown',
          manufacturer: 'test',
          class: 'test',
        }
      },
    });
    expect(wrapper.html()).toContain('warning')
  });

});
