import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it } from 'vitest';

import TerminalComponent from 'src/components/terminal/TerminalComponent.vue';

installQuasarPlugin({ plugins: { Notify } });

describe('terminal component', () => {
  it('should load [loading]', async () => {
    expect(TerminalComponent).toBeTruthy();
    const wrapper = mount(TerminalComponent, {
      props: {
        host: {
          username: 'user',
          password: '',
          hostname: 'fakeL',
          port: 22,
          protocol: 'http',
        },
      },
    });
    expect(wrapper.html()).toContain('toolbar');
  });
});
