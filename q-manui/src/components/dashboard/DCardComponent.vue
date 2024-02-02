<template>
  <q-card flat bordered v-if="$props.loading" class="col-grow q-ma-sm">
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <q-skeleton type="QAvatar" size="38px" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="card-value">
          <q-skeleton type="text" />
        </q-item-label>
        <q-item-label class="card-caption">
          <q-skeleton type="text" />
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-card>
  <q-card
    v-if="!$props.loading"
    flat
    bordered
    :class="`${$props.class} col-grow q-ma-sm`"
    style="height: 73px"
  >
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <q-icon :name="$props.icon" size="42px" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="card-value">{{ $props.value }}</q-item-label>
        <q-item-label class="card-caption">{{ $props.caption }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<style lang="css" scoped>
.card-value {
  font-size: 28px;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DCardComponent',
  props: {
    icon: String,
    class: String,
    value: String,
    caption: String,
    loading: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    return {};
  },
});
</script>
