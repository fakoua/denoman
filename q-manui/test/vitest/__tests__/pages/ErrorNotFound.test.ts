import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it } from 'vitest';
import ErrorNotFound from 'src/pages/ErrorNotFound.vue';

installQuasarPlugin({ plugins: { Notify } });

describe('main layout component', () => {
  it('should load [loading]', async () => {
    expect(ErrorNotFound).toBeTruthy();
    const wrapper = mount(ErrorNotFound);
    expect(wrapper.html()).toContain('404');
  });
});
