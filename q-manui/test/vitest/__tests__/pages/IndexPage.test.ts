import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import IndexPage from 'src/pages/IndexPage.vue';

installQuasarPlugin({ plugins: { Notify } });

describe('main layout component', () => {
  it('should load [loading]', async () => {
    expect(IndexPage).toBeTruthy();
    const wrapper = mount(IndexPage,{
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
        })],
      },
    });
    expect(wrapper.classes()).toContain('q-page');
    expect(wrapper.html()).toContain('<main');
  });
});
