<template>
  <q-card flat bordered style="min-height: 268px">
    <q-card-section style="color: #0b219b">
      <div class="text-h6">Memory</div>
      <div class="text-weight-thin">Memory Usage</div>
    </q-card-section>
    <div>
      <apexchart
        ref="memoryChart"
        height="360px"
        type="area"
        :options="options"
        :series="series"
      ></apexchart>
    </div>
  </q-card>
  <div class="fit row wrap justify-start items-start content-start q-mt-md">
    <div class="q-ml-md bl">
      <div class="text-caption">Total Memory</div>
      <div class="text-weight-bolder">
        {{ (perfmon.memory.totalMemory / 1024 / 1024).toFixed(1) }} GB
      </div>
    </div>
    <div class="q-ml-md bl">
      <div class="text-caption">Used Memory</div>
      <div class="text-weight-bolder">
        {{ (usedMemory / 1024 / 1024).toFixed(1) }}
        GB
      </div>
    </div>
    <div class="q-ml-md bl">
      <div class="text-caption">Free Memory</div>
      <div class="text-weight-bolder">
        {{ (perfmon.memory.freeMemory / 1024 / 1024).toFixed(1) }} GB
      </div>
    </div>
  </div>
  <q-linear-progress
    size="50px"
    :value="usedMemoryPercentage / 100"
    color="#0b219b"
    class="q-mt-sm"
  >
    <div class="absolute-full flex flex-center">
      <q-badge
        color="white"
        text-color="#0b219b"
        :label="usedMemoryPercentage.toFixed(1) + '%'"
      />
    </div>
  </q-linear-progress>
</template>

<style lang="css" scoped>
.q-linear-progress {
  color: #0b219b;
}
.q-linear-progress .q-badge {
  color: #0b219b;
}
.bl {
  border-left: 2px dotted #0b219b;
  padding-left: 4px;
}
</style>

<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue';
import _fill from 'lodash/fill';

import { PerfmonModel, SystemModel } from '../models';
import { VueApexChartsComponent } from 'vue3-apexcharts';
import { getChartOptions } from './common';

export default defineComponent({
  name: 'MemoryComponent',
  props: {
    perfmon: {
      type: Object as PropType<PerfmonModel>,
      required: true,
    },
    system: {
      type: Object as PropType<SystemModel>,
      required: true,
    },
  },

  watch: {
    perfmon: {
      handler: function () {
        this.updateSeries();
      },
      deep: true,
    },
  },

  setup(props) {
    const loading = ref(true);
    const memoryChart = ref(null);
    const data: number[] = _fill(Array(20), 0);

    const usedMemory = computed(() => {
      return props.perfmon.memory.totalMemory - props.perfmon.memory.freeMemory;
    });

    const usedMemoryPercentage = computed(() => {
      return (usedMemory.value / props.perfmon.memory.totalMemory) * 100;
    });

    const options = getChartOptions();
    options.chart.id = 'memory';

    const series = [
      {
        name: 'memory',
        data: data.slice(),
      },
    ];

    const updateSeries = () => {
      if (props.perfmon.cpu === -1) return;
      const memory =
        ((props.perfmon.memory.totalMemory - props.perfmon.memory.freeMemory) /
          props.perfmon.memory.totalMemory) *
        100;
      data.push(memory);
      if (data.length > 20) data.shift();

      if (memoryChart.value) {
        (memoryChart.value as VueApexChartsComponent).updateSeries([
          {
            data: data,
          },
        ]);
      }
    };

    return {
      loading,
      options,
      series,
      memoryChart,
      usedMemory,
      usedMemoryPercentage,
      updateSeries,
    };
  },
});
</script>
