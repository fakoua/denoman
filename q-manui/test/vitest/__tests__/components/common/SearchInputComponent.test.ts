import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it } from 'vitest';
import SearchInputComponent from 'src/components/common/SearchInputComponent.vue'

installQuasarPlugin({ plugins: { Notify } });

describe('search input', () => {
  it('should have placeholder', async () => {
    expect(SearchInputComponent).toBeTruthy();

    const wrapper = mount(SearchInputComponent, {
      props: {
        placeholder: '-Search-',
      },
    });

    expect(wrapper.find('input').attributes('placeholder')).toBe('-Search-');
  });
});
