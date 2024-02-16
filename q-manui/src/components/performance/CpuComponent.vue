<template>
  <q-card flat bordered style="min-height: 268px">
    <q-card-section style="color: #ff4560">
      <div class="text-h6">CPU</div>
      <div class="text-weight-thin">CPU Usage %</div>
    </q-card-section>
    <div>
      <apexchart
        ref="chart"
        height="360px"
        type="area"
        :options="options"
        :series="series"
      ></apexchart>
    </div>
  </q-card>
  <div class="fit row wrap justify-start items-start content-start q-mt-md">
    <div class="q-ml-md bl">
      <div class="text-caption">Utilization</div>
      <div class="text-weight-bolder">{{ perfmon.cpu }}%</div>
    </div>
    <div class="q-ml-md bl">
      <div class="text-caption">Processor</div>
      <div class="text-weight-bolder">{{ system.processorName }}</div>
    </div>
  </div>
  <q-linear-progress size="50px" :value="perfmon.cpu / 100" class="q-mt-sm">
    <div class="absolute-full flex flex-center">
      <q-badge
        color="white"
        text-color="#ff4560"
        :label="perfmon.cpu.toFixed(1) + '%'"
      />
    </div>
  </q-linear-progress>
</template>

<style lang="css" scoped>
.q-linear-progress {
  color: #ff4560;
}
.q-linear-progress .q-badge {
  color: #ff4560;
}
.bl {
  border-left: 2px dotted #ff4560;
  padding-left: 4px;
}
</style>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import _fill from 'lodash/fill';

import { PerfmonModel, SystemModel } from '../models';
import { VueApexChartsComponent } from 'vue3-apexcharts';
import { getChartOptions } from './common';

export default defineComponent({
  name: 'CpuComponent',
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
