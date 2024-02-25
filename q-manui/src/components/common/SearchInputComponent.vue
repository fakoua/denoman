<template>
  <q-input
    ref="filterInput"
    borderless
    dense
    filled
    clearable
    v-model="filter"
    :placeholder="placeholder"
    style="width: 300px"
    input-style="width: 100%;"
    @focus="
      () => {
        filterFocused = true;
      }
    "
    @blur="
      () => {
        filterFocused = false;
      }
    "
  >
    <template v-slot:append>
      <q-chip
        outline
        square
        color="grey-14"
        text-color="white"
        label="Ctrl+K"
        v-if="!filterFocused && !filter"
      />
      <q-icon name="search" v-if="filterFocused && !filter" />
    </template>
  </q-input>
</template>

<style lang="css" scoped></style>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'SearchInputComponent',

  props: {
    placeholder: {
      type: String,
      required: false,
    },
  },

  setup() {
    const filterInput = ref(null);
    const filter = ref('');
    const filterFocused = ref(false);

    const captureCtrlK = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        if (filterInput.value) {
          (filterInput.value as HTMLElement).focus();
        }
      }
    };

    onMounted(() => {
      window.addEventListener('keydown', captureCtrlK);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', captureCtrlK);
    });

    return {
      filter,
      filterInput,
      filterFocused,
    };
  },
});
</script>
