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
  <q-card flat bordered v-if="!loading">
    <q-card-section>
      <div class="text-h6 text-red-6">
        <q-icon name="notification_important" />
        Critical
      </div>
      <div class="text-weight-thin text-red-3">
        Automatic services & not running
      </div>
    </q-card-section>
    <div class="critical-table">
      <q-markup-table dense flat>
        <tbody>
          <tr v-for="s in critical" :key="s.name">
            <td class="text-red-9">
              <q-icon name="sync_problem" /> {{ s.caption }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </q-card>
</template>

<style lang="css" scoped>
.critical-table {
  overflow-y: auto;
  max-height: 172px;
}
</style>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { ServiceModel } from '../models';

export default defineComponent({
  name: 'CriticalComponent',
  props: {
    critical: Object as PropType<ServiceModel[] | undefined>,
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
