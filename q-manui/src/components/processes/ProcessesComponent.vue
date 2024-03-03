<template>
  <q-table
    bordered
    square
    :rows="data"
    :columns="columns"
    color="primary"
    row-key="processName"
    selection="single"
    :loading="isLoading"
    :filter="filter"
    dense
    flat
    virtual-scroll
    :rows-per-page-options="[0]"
    v-model:pagination="pagination"
    class="my-sticky-header-table"
    separator="cell"
    wrap-cells
    v-model:selected="selected"
    style="height: calc(100vh - 110px)"
  >
    <template v-slot:top-right>
      <search-input-component v-model="filter" placeholder="Search Processes" />
    </template>

    <template v-slot:body="props">
      <q-tr
        :props="props"
        v-on:click="
          (e: PointerEvent) => {
            onSelect(props.row);
          }
        "
      >
        <q-td style="padding: 0">
          <q-checkbox v-model="props.selected" />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <q-btn
            v-if="col.name === 'processName'"
            size="sm"
            flat
            dense
            @click="
              (e) => {
                e.stopPropagation();
                e.preventDefault();

                if (!props.expand) {
                  onSelect(props.row);
                  if (expendedRowProps.rowIndex > -1) {
                    expendedRowProps.expand = false;
                  }
                  expendedRowProps = props;
                } else {
                  expendedRowProps = { expand: false, rowIndex: -1 };
                }
                props.expand = !props.expand;
              }
            "
            :icon="props.expand ? 'expand_less' : 'expand_more'"
          />
          {{ col.value }}
        </q-td>
      </q-tr>
      <q-tr v-if="props.expand" v-show="props.expand" :props="props">
        <q-td colspan="100%" style="padding-left: 6px; background-color: white">
          <div class="text-left">
            <process-children-component :children="props.row.children" />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style lang="css" scoped>
.my-sticky-header-table .q-table__top,
.my-sticky-header-table .q-table__bottom,
.my-sticky-header-table thead tr:first-child th {
  background-color: #ffffff;
}
.my-sticky-header-table thead tr th {
  position: sticky;
  z-index: 1;
}
.my-sticky-header-table thead tr:first-child th {
  top: 0;
}
.my-sticky-header-table.q-table--loading thead tr:last-child th {
  top: 48px;
}
.my-sticky-header-table tbody {
  scroll-margin-top: 48px;
}
</style>
<script lang="ts">
import { PropType, onMounted, defineComponent, ref } from 'vue';
import { QTableColumn } from 'quasar';
import _ from 'lodash';

import SearchInputComponent from '../common/SearchInputComponent.vue';
import ProcessChildrenComponent from './ProcessChildrenComponent.vue';

import * as serviceApi from '../service-api';
import {
  WinRMPayload,
  ProcessModel,
  ParentProcessModel,
  ExpandedRowProps,
} from '../models';

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
    sortable: true,
    align: 'left',
  },
  {
    name: 'cpu',
    label: 'CPU(s)',
    field: 'cpu',
    sortable: true,
    align: 'left',
    format: (d: number) => {
      return cpuFormatter(d);
    },
    style: 'width:164px',
    sort(a, b) {
      return a - b;
    },
  },
  {
    name: 'ws',
    label: 'Working Set (memory)',
    field: 'ws',
    sortable: true,
    style: 'width:164px',
    format: (d: number) => {
      d = d / 1024;
      const formattedNumber = d
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedNumber} K`;
    },
    sort(a, b) {
      return a - b;
    },
  },
];

export default defineComponent({
  name: 'ProcessesComponent',
  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },

  components: {
    SearchInputComponent,
    ProcessChildrenComponent,
  },

  methods: {
    onSelect(row: ProcessModel) {
      this.selected = [row];
    },
  },

  setup(props) {
    const data = ref<ParentProcessModel[]>([]);
    const isLoading = ref(true);
    const filter = ref('');
    const pagination = ref({ sortBy: 'processName', descending: false });
    const selected = ref([] as ProcessModel[]);
    const expendedRowProps = ref<ExpandedRowProps>({
      expand: false,
      rowIndex: -1,
    });

    onMounted(async () => {
      const response = await serviceApi.getProcesses(props.host);
      data.value = _.chain(response)
        .groupBy('processName')
        .map((value, key) => {
          return {
            processName: key,
            cpu: _.sumBy(value, 'cpu'),
            ws: _.sumBy(value, 'ws'),
            children: value,
          };
        })
        .value();
      isLoading.value = false;
    });

    return {
      data,
      isLoading,
      columns,
      filter,
      pagination,
      selected,
      expendedRowProps,
    };
  },
});
</script>
