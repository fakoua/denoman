<template>
  <div v-if="!firstLoad">
    <div class="skeleton-tabs">
      <q-skeleton type="QBtn" />
      <q-skeleton type="QBtn" />
      <q-skeleton type="QBtn" />
      <q-skeleton type="QBtn" />
      <q-skeleton type="QBtn" />
    </div>
    <div>
      <q-skeleton type="text" />
      <q-skeleton type="text" width="80%" />
    </div>
  </div>
  <div v-if="firstLoad">
    <q-tabs v-model="selectedTab" align="right">
      <q-tab name="cpu" label="CPU" />
      <q-tab name="memory" label="Memory" />
      <q-tab
        v-for="disk in perfmon.disks"
        :key="disk.name"
        :name="disk.name"
        :label="'Disk ' + disk.name"
      />
      <q-tab name="network" label="Network" />
    </q-tabs>
    <q-tab-panels v-model="selectedTab" keep-alive>
      <q-tab-panel name="cpu">
        <cpu-component :perfmon="perfmon" />
      </q-tab-panel>
      <q-tab-panel name="memory">
        <memory-component :perfmon="perfmon" />
      </q-tab-panel>
      <q-tab-panel
        v-for="disk in perfmon.disks"
        :key="disk.name"
        :name="disk.name"
      >
        <disk-component :disk="disk" />
      </q-tab-panel>
      <q-tab-panel name="network">
        <network-component :network="perfmon.networks" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<style lang="css" scoped>
.skeleton-tabs {
  display: flow-root;
  margin-bottom: 15px;
}
.skeleton-tabs .q-skeleton {
  margin-left: 10px;
  float: right;
}
</style>

<script lang="ts">
import { PropType, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import CpuComponent from './CpuComponent.vue';
import MemoryComponent from './MemoryComponent.vue';
import DiskComponent from './DiskComponent.vue';
import NetworkComponent from './NetworkComponent.vue';

import * as serviceApi from '../service-api';
import { WinRMPayload, PerfmonModel } from '../models';

export default defineComponent({
  name: 'PerfmonComponent',
  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },
  components: {
    CpuComponent,
    MemoryComponent,
    DiskComponent,
    NetworkComponent,
  },

  setup(props) {
    const firstLoad = ref(false);
    const selectedTab = ref('cpu');
    const perfmon = ref<PerfmonModel>({
      cpu: -1,
      memory: {
        freeMemory: 0,
        totalMemory: 0,
      },
      disks: [],
      networks: {
        bytesReceivedPersec: -1,
        bytesSentPersec: -1,
        bytesTotalPersec: -1,
        name: '',
      },
    });
    let timeoutId = -1;
    let runTimer = true;

    const updateData = async () => {
      perfmon.value = await serviceApi.getPerfmon(props.host);
      firstLoad.value = true;
      if (runTimer) {
        timeoutId = window.setTimeout(updateData, 3000);
      }
    };

    onMounted(async () => {
      updateData();
    });

    onUnmounted(() => {
      if (timeoutId !== -1) {
        runTimer = false;
        window.clearTimeout(timeoutId);
      }
    });

    return { firstLoad, perfmon, selectedTab };
  },
});
</script>
