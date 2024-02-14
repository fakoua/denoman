<template>
  <q-table
    bordered
    square
    :rows="data"
    :columns="columns"
    color="primary"
    row-key="name"
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
    @row-click="
      (_, row) => {
        onSelect(row);
      }
    "
    @row-dblclick="
      (_, row) => {
        onDoubleClick(row);
      }
    "
  >
    <template v-slot:top-left>
      <div class="div-buttons">
        <q-btn
          outline
          round
          color="primary"
          icon="play_arrow"
          size="10px"
          @click="controlService('Start')"
          :disable="disabledControls[0]"
        />
        <q-btn
          outline
          round
          color="primary"
          icon="stop"
          size="10px"
          @click="controlService('Stop')"
          :disable="disabledControls[1]"
        />
        <q-btn
          outline
          round
          color="primary"
          icon="pause"
          size="10px"
          @click="controlService('Suspend')"
          :disable="disabledControls[2]"
        />
        <q-btn
          outline
          round
          color="primary"
          icon="motion_photos_paused"
          size="10px"
          @click="controlService('Resume')"
          :disable="disabledControls[3]"
        />
        <q-btn
          outline
          round
          color="primary"
          icon="replay"
          size="10px"
          @click="controlService('Restart')"
          :disable="disabledControls[4]"
        />
        <q-toggle
          v-model="showSystemDriver"
          color="primary"
          icon="settings"
          label="Show system drivers"
        />
      </div>
    </template>
    <template v-slot:top-right>
      <q-input
        ref="filterInput"
        borderless
        dense
        filled
        clearable
        v-model="filter"
        placeholder="Search Services"
        style="width: 300px"
        input-style="width: 100%;"
        @focus="
          () => {
            filterFocused = true;
          }
        "
        @blur="
          () => {
            filterFocused = false;
          }
        "
      >
        <template v-slot:append>
          <q-chip
            outline
            square
            color="grey-14"
            text-color="white"
            label="Ctrl+K"
            v-if="!filterFocused"
          />
          <q-icon name="search" v-if="filterFocused" />
        </template>
      </q-input>
    </template>
    <template v-slot:body-cell="props">
      <q-td :props="props" :class="rowStyle(props.row)">
        {{ props.value }}
      </q-td>
    </template>
    <template v-slot:item="props">
      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition grid-cell"
        :style="props.selected ? 'transform: scale(0.98);' : ''"
      >
        <q-card
          bordered
          flat
          :class="
            props.selected ? ($q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2') : ''
          "
          @click="
            () => {
              props.selected = true;
            }
          "
        >
          <q-card-section style="padding: 0">
            <q-list bordered>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="settings" size="40px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ props.row.caption }}</q-item-label>
                  <q-item-label class="grid-state" caption lines="1">{{
                    props.row.state
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </q-table>
</template>

<style lang="css" scoped>
.grid-state {
  font-size: 12px;
}
.grid-style-transition {
  transition: transform 0.28s, background-color 0.28s;
}
.my-sticky-header-table {
  height: calc(100vh - 94px);
  width: 100%;
}
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
.div-buttons button {
  margin-left: 6px;
}
.system-driver {
  font-size: 11px;
}
</style>

<script lang="ts">
import { PropType, defineComponent, onMounted, onUnmounted, ref } from 'vue';

import * as serviceApi from '../service-api';
import { ControlAction, ServiceModel, WinRMPayload } from '../models';
import { bus } from 'boot/bus';
import { QTableColumn, useQuasar } from 'quasar';

const columns: QTableColumn[] = [
  {
    name: 'caption',
    label: 'Name',
    field: 'caption',
    sortable: true,
    align: 'left',
  },
  {
    name: 'state',
    label: 'Status',
    field: 'state',
    sortable: true,
    align: 'left',
    style: 'width:80px',
    format: (val: string) => {
      return val === 'Stopped' ? '' : val;
    },
  },
  {
    name: 'startMode',
    label: 'Startup Type',
    field: 'startMode',
    sortable: true,
    align: 'left',
    style: 'width:110px',
    format: (val: string) => {
      return val === 'Auto' ? 'Automatic' : val;
    },
  },
  {
    name: 'serviceType',
    label: 'Type',
    field: 'serviceType',
    sortable: true,
    align: 'left',
    style: 'width:116px',
  },
  {
    name: 'startName',
    label: 'Log On',
    field: 'startName',
    sortable: true,
    align: 'left',
    format: (val: string) => {
      return val.replaceAll('|', '\\');
    },
  },
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    sortable: true,
    align: 'left',
  },
];

export default defineComponent({
  name: 'ServicesListComponent',

  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },
  methods: {
    onSelect(row: ServiceModel) {
      this.selected = [row];
      const service = this.selected[0] as ServiceModel;

      this.setDisabledControls(service);
      this.$emit('onSelectService', row as ServiceModel);
    },
    rowStyle(service: ServiceModel): string {
      if (service.isSystemDriver) {
        return 'text-blue-6 text-weight-thin system-driver';
      }
      return service.state == 'Stopped' ? 'text-red-6' : 'bg-white text-black';
    },
    onDoubleClick(row: ServiceModel) {
      this.$emit('onOpenService', row as ServiceModel);
    },
    controlService(action: ControlAction) {
      if (this.selected && this.selected.length > 0) {
        bus.emit('controlService', {
          action: action,
          name: (this.selected[0] as ServiceModel).name,
        });
      }
    },
  },

  watch: {
    showSystemDriver: function (value) {
      this.data = this.services.filter((v) =>
        value ? true : !v.isSystemDriver
      );
    },
  },

  emits: ['onSelectService', 'onOpenService'],

  setup(props) {
    const services = ref<ServiceModel[]>([]); //All services
    const data = ref<ServiceModel[]>([]); //Services filtered by isSystemData
    const isLoading = ref(true);
    const showSystemDriver = ref(false);
    const disabledControls = ref<boolean[]>([true, true, true, true, true]);
    const selected = ref([] as ServiceModel[]);
    const filterInput = ref(null);
    const filterFocused = ref(false);
    const $q = useQuasar();

    const loadServices = async () => {
      const res = await serviceApi.getServices(props.host);
      if (res) {
        services.value = res;
        data.value = services.value.filter((v) => {
          return !v.isSystemDriver;
        });
      }
    };

    const setDisabledControls = (service: ServiceModel) => {
      disabledControls.value[0] = service.state !== 'Stopped';
      disabledControls.value[1] = !service.acceptStop;
      disabledControls.value[2] = !(
        service.state === 'Running' && service.acceptPause
      );
      disabledControls.value[3] = service.state !== 'Paused';
      disabledControls.value[4] = service.state !== 'Running';
    };

    const captureCtrlK = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        if (filterInput.value) {
          (filterInput.value as HTMLElement).focus();
        }
      }
    };

    onMounted(async () => {
      document.addEventListener('keydown', captureCtrlK);
      await loadServices();
      isLoading.value = false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bus.on('controlService', async (action: any) => {
        $q.loading.show();
        const res = await serviceApi.controlService(
          props.host,
          action.action,
          action.name
        );
        await loadServices();
        bus.emit('serviceChanged', res);
        if (res) {
          setDisabledControls(res);
        }
        $q.loading.hide();
      });
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', captureCtrlK);
      bus.off('controlService');
    });

    return {
      columns,
      data,
      filter: ref(''),
      selected: selected,
      pagination: ref({
        rowsPerPage: 0,
      }),
      isLoading,
      services,
      showSystemDriver,
      disabledControls,
      filterInput,
      filterFocused,
      setDisabledControls,
    };
  },
});
</script>
