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
    <q-card-section class="text-blue-6">
      <div class="text-h6">Top Dependency Services</div>
      <div class="text-weight-thin">Other services requires these services</div>
    </q-card-section>
    <div class="critical-table">
      <q-markup-table dense flat>
        <tbody>
          <tr>
            <td class="text-weight-bold">Service</td>
            <td class="text-weight-bold text-right">Required By</td>
          </tr>
          <tr v-for="item in deps" :key="item[0]">
            <td>
              {{ item[0] }}
            </td>
            <td class="text-right">
              {{ item[1] }}
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
import { defineComponent } from 'vue';
import { PropType } from 'vue';

export default defineComponent({
  name: 'TopDependencyComponent',
  props: {
    deps: Object as PropType<[service: string, count: number][]>,
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
