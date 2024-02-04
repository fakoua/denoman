<template>
  <q-card flat bordered style="min-height: 268px" v-if="loading">
    <q-item>
      <q-item-section avatar>
        <q-skeleton type="QAvatar" />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <q-skeleton type="text" />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton type="text" />
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-skeleton height="200px" square />
  </q-card>
  <q-card flat bordered style="min-height: 268px" v-if="!loading">
    <q-card-section class="text-indigo-6">
      <div class="text-h6">System</div>
      <div class="text-weight-thin">System Information</div>
    </q-card-section>
    <q-list bordered>
      <q-item>
        <q-item-section avatar>
          <q-icon color="primary" name="laptop_windows" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ system?.csName }}</q-item-label>
          <q-item-label caption lines="2" style="font-size: 11px">{{
            system?.caption
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon color="primary" name="storage" />
        </q-item-section>

        <q-item-section style="font-size: 12px"
          >{{ system?.processorName }} ({{
            system?.osArchitecture
          }})</q-item-section
        >
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon color="primary" name="memory" />
        </q-item-section>

        <q-item-section>{{ system?.memory }} RAM</q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PropType } from 'vue';

import { SystemModel } from '../models';

export default defineComponent({
  name: 'SystemInfoComponent',
  props: {
    system: Object as PropType<SystemModel>,
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
