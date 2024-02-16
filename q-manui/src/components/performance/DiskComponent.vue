<template>
  <q-card flat bordered style="min-height: 268px">
    <q-card-section style="color: #ffc107">
      <div class="text-h6">Disk {{ disk.name }}</div>
      <div class="text-weight-thin">Active time</div>
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
      <div class="text-caption">Disk</div>
      <div class="text-weight-bolder">
        {{ disk.name }}
      </div>
    </div>
    <div class="q-ml-md bl">
      <div class="text-caption">Reading speed</div>
      <div class="text-weight-bolder">
        {{ disk.diskReadBytesPersec.bytes().toString() }}/s
      </div>
    </div>
    <div class="q-ml-md bl">
      <div class="text-caption">Writing speed</div>
      <div class="text-weight-bolder">
        {{ disk.diskWriteBytesPersec.bytes().toString() }}/s
      </div>
    </div>
  </div>
  <q-linear-progress size="50px" :value="diskPerc / 100" class="q-mt-sm">
    <div class="absolute-full flex flex-center">
      <q-badge color="white" :label="diskPerc.toFixed(1) + '%'" />
    </div>
  </q-linear-progress>
</template>

<style lang="css" scoped>
.q-linear-progress {
  color: #ffc107;
}
.q-linear-progress .q-badge {
  color: #ffc107;
}
.bl {
  border-left: 2px dotted #ffc107;
  padding-left: 4px;
}
</style>

<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue';
import _fill from 'lodash/fill';
import 'Humanizer.node';

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

    const diskPerc = computed(() => {
      return props.disk.percentDiskTime > 100
        ? 100
        : props.disk.percentDiskTime;
    });

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
      data.push(
        props.disk.percentDiskTime > 100 ? 100 : props.disk.percentDiskTime,
      );
      if (data.length > 20) data.shift();

      if (chart.value) {
        (chart.value as VueApexChartsComponent).updateSeries([
          {
            data: data,
          },
        ]);
      }
    };

    return { loading, options, series, chart, diskPerc, updateSeries };
  },
});
</script>
