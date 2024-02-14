<template>
  <q-card flat bordered style="min-height: 268px">
    <q-card-section class="text-blue-6">
      <div class="text-h6">Memory</div>
      <div class="text-weight-thin">Memory Usage</div>
    </q-card-section>
    <div>
      <apexchart
        ref="memoryChart"
        height="640px"
        type="area"
        :options="options"
        :series="series"
      ></apexchart>
    </div>
  </q-card>
</template>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import _fill from 'lodash/fill';

import { PerfmonModel } from '../models';
import { VueApexChartsComponent } from 'vue3-apexcharts';
import { getChartOptions } from './common';

export default defineComponent({
  name: 'MemoryComponent',
  props: {
    perfmon: {
      type: Object as PropType<PerfmonModel>,
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

    return { loading, options, series, memoryChart, updateSeries };
  },
});
</script>
