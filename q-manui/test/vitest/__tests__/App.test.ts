import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it } from 'vitest';
import App from 'src/App.vue';

installQuasarPlugin({ plugins: { Notify } });

describe('app component', () => {
  it('should load [loading]', async () => {
    expect(App).toBeTruthy();
    const wrapper = mount(App);
    expect(wrapper.html()).toContain('router-view');
  });
});
