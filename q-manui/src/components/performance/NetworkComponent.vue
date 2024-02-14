<template>
  <q-card flat bordered style="min-height: 268px">
    <q-card-section class="text-blue-6">
      <div class="text-h6">{{ network.name }}</div>
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

import { NetworkModel } from '../models';
import { VueApexChartsComponent } from 'vue3-apexcharts';
import { getChartOptions } from './common';

export default defineComponent({
  name: 'NetworkComponent',
  props: {
    network: {
      type: Object as PropType<NetworkModel>,
      required: true,
    },
  },

  watch: {
    network: {
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

    const options = getChartOptions(true);
    options.chart.id = 'network';
    options.yaxis.labels.show = true;
    delete options.yaxis.max;
    options.colors = ['#4caf50'];

    const series = [
      {
        name: 'network',
        data: data.slice(),
      },
    ];

    const updateSeries = () => {
      data.push(Math.round((props.network.bytesTotalPersec / 1024 / 1024) * 8));
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
