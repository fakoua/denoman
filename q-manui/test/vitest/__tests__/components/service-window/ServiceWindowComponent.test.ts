import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it} from 'vitest';

import ServiceWindowComponent from '../../../../../src/components/service-window/ServiceWindowComponent.vue';

installQuasarPlugin({ plugins: { Notify } });

describe('service window component', () => {
  it('should load [after loading]', async () => {
    const wrapper = mount(ServiceWindowComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeK',
          port: 22,
          protocol: 'http',
        },
      },
    });

    expect(wrapper.html()).not.toContain('Loading...');
  });
});
