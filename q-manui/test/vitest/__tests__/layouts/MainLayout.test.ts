import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it } from 'vitest';

import MainLayout from 'src/layouts/MainLayout.vue';

installQuasarPlugin({ plugins: { Notify } });

describe('main layout component', () => {
  it('should load [loading]', async () => {
    expect(MainLayout).toBeTruthy();
    const wrapper = mount(MainLayout);
    expect(wrapper.html()).toContain('icons/denoman.svg');
  });
});
