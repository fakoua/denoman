<template>
  <q-card flat bordered style="min-height: 268px">
    <q-card-section class="text-blue-6">
      <div class="text-h6">Disk {{ disk.name }}</div>
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

import { DiskModel } from '../models';
import { VueApexChartsComponent } from 'vue3-apexcharts';
import { getChartOptions } from './common';

export default defineComponent({
  name: 'DiskComponent',
  props: {
    disk: {
      type: Object as PropType<DiskModel>,
      required: true,
    },
  },

  watch: {
    disk: {
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
    options.chart.id = `disk-${props.disk.name}`;
    options.colors = ['#ffc107'];

    const series = [
      {
        name: `disk-${props.disk.name}`,
        data: data.slice(),
      },
    ];

    const updateSeries = () => {
      data.push(props.disk.percentDiskTime);
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
