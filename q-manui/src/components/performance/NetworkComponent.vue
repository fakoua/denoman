<template>
  <q-card flat bordered style="min-height: 268px">
    <q-card-section style="color: #4caf50">
      <div class="text-h6">{{ network.name }}</div>
      <div class="text-weight-thin">Throughput</div>
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
    <div class="q-ml-md bl" style="width: 130px">
      <div class="text-caption">Total</div>
      <div class="text-weight-bolder">
        {{ formatBytesPerSec(network.bytesTotalPersec) }}
      </div>
    </div>
    <div class="q-ml-md bl">
      <div class="text-caption">NIC</div>
      <div class="text-weight-bolder">
        {{ network.name }}
      </div>
    </div>
  </div>
  <div class="fit row wrap justify-start items-start content-start q-mt-md">
    <div class="q-ml-md bl" style="width: 130px">
      <div class="text-caption">Send</div>
      <div class="text-weight-bolder">
        {{ formatBytesPerSec(network.bytesSentPersec) }}
      </div>
    </div>
    <div class="q-ml-md bl">
      <div class="text-caption">Receive</div>
      <div class="text-weight-bolder">
        {{ formatBytesPerSec(network.bytesReceivedPersec) }}
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.q-linear-progress {
  color: #4caf50;
}
.q-linear-progress .q-badge {
  color: #4caf50;
}
.bl {
  border-left: 2px dotted #4caf50;
  padding-left: 4px;
}
</style>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import _fill from 'lodash/fill';

import { NetworkModel } from '../models';
import { VueApexChartsComponent } from 'vue3-apexcharts';
import { getChartOptions, formatBytesPerSec } from './common';

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
    options.yaxis.labels.formatter = (value: number) => {
      return (value < 2 ? value.toFixed(1) : value.toFixed(0)) + ' Mbps';
    };
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

    return {
      loading,
      options,
      series,
      chart,
      formatBytesPerSec,
      updateSeries,
    };
  },
});
</script>
