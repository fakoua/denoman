<template>
  <q-card flat bordered style="min-height: 268px">
    <q-card-section class="text-blue-6">
      <div class="text-h6">CPU</div>
      <div class="text-weight-thin">CPU Usage %</div>
    </q-card-section>
    <div>
      <apexchart
        ref="chart"
        height="640px"
        type="area"
        :options="options"
        :series="series"
      ></apexchart>
    </div>
  </q-card>
</template>

<style lang="css" scoped></style>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import _fill from 'lodash/fill';

import { PerfmonModel } from '../models';
import { VueApexChartsComponent } from 'vue3-apexcharts';
import { getChartOptions } from './common';

export default defineComponent({
  name: 'CpuComponent',
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
    const chart = ref(null);
    const data: number[] = _fill(Array(20), 0);

    const options = getChartOptions();
    options.chart.id = 'cpu';
    options.colors = ['#FF4560'];

    const series = [
      {
        name: 'cpu',
        data: data.slice(),
      },
    ];

    const updateSeries = () => {
      if (props.perfmon.cpu === -1) return;
      data.push(props.perfmon.cpu);
      if (data.length > 20) data.shift();

      if (chart.value) {
        (chart.value as VueApexChartsComponent).updateSeries([
          {
            data: data,
          },
        ]);
      }
    };

    return { loading, options, series, chart, updateSeries };
  },
});
</script>
