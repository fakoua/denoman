<template>
  <div>
    <div class="text-caption text-bold">Details</div>
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label class="text-caption text-bold">Device</q-item-label>
          <q-item-label caption>{{ device.caption }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-caption text-bold"
            >Description</q-item-label
          >
          <q-item-label caption>{{ device.description }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-caption text-bold"
            >Manufacturer</q-item-label
          >
          <q-item-label caption>{{ device.manufacturer }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-caption text-bold"
            >Device Type</q-item-label
          >
          <q-item-label caption>{{ device.class }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-caption text-bold">Status</q-item-label>
          <q-item-label caption
            ><q-icon :name="icon.name" :color="icon.color" size="20px" />
            {{ device.status }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { PropType, computed, defineComponent } from 'vue';

import { DeviceModel } from '../models';

export default defineComponent({
  name: 'DeviceDetailsComponent',
  props: {
    device: {
      type: Object as PropType<DeviceModel>,
      required: true,
    },
  },
  setup(props) {
    const icon = computed(() => {
      return {
        name: props.device.status === 'OK' ? 'check' : 'warning',
        color: props.device.status === 'OK' ? 'green' : 'red',
      };
    });
    return { icon };
  },
});
</script>
