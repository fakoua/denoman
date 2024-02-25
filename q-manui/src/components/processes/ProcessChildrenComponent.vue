<template>
  <div>
    <q-table
      bordered
      :rows="children"
      :columns="columns"
      color=""
      row-key="id"
      dense
      flat
      separator="none"
      wrap-cells
      :rows-per-page-options="[0]"
      card-class="bg-blue-6 text-white"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { ProcessModel } from '../models';
import { QTableColumn } from 'quasar';

const cpuFormatter = (d: number) => {
  const hours = Math.floor(d / 3600);
  const minutes = Math.floor((d % 3600) / 60);
  const seconds = Math.floor((d % 3600) % 60);

  const formattedTime = `${hours.toString()}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime;
};

const columns: QTableColumn[] = [
  {
    name: 'processName',
    label: 'Process',
    field: 'processName',
    align: 'left',
  },
  {
    name: 'id',
    label: 'PID',
    field: 'id',
    align: 'left',
    style: 'width:164px',
  },
  {
    name: 'cpu',
    label: 'CPU(s)',
    field: 'cpu',
    align: 'left',
    format: (d: number) => {
      return cpuFormatter(d);
    },
    style: 'width:164px',
  },
  {
    name: 'ws',
    label: 'Working Set (memory)',
    field: 'ws',
    style: 'width:164px',
    format: (d: number) => {
      d = d / 1024;
      const formattedNumber = d
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedNumber} K`;
    },
  },
  {
    name: 'startTime',
    label: 'Start Time',
    field: 'startTime',
    style: 'width:164px',
  },
];

export default defineComponent({
  name: 'ProcessChildrenComponent',
  props: {
    children: {
      type: Object as PropType<ProcessModel[]>,
      required: true,
    },
  },

  setup() {
    return { columns };
  },
});
</script>
