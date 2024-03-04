<template>
  <div class="q-pa-md" v-if="isLoading">
    <q-item style="max-width: 500px">
      <q-item-section avatar>
        <q-skeleton type="QAvatar" />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <q-skeleton type="text" />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton type="text" width="65%" />
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-item style="max-width: 500px">
      <q-item-section avatar>
        <q-skeleton type="QAvatar" />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <q-skeleton type="text" />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton type="text" width="90%" />
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-item style="max-width: 500px">
      <q-item-section avatar>
        <q-skeleton type="QAvatar" />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <q-skeleton type="text" width="35%" />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton type="text" />
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
  <div
    v-if="!isLoading"
    class="q-gutter-sm"
    style="height: calc(100vh - 100px)"
  >
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <div class="tree-container">
          <q-input ref="filterRef" filled v-model="filter" label="Filter" dense>
            <template v-slot:append>
              <q-icon
                v-if="filter !== ''"
                name="clear"
                class="cursor-pointer"
                @click="resetFilter"
              />
            </template>
          </q-input>
          <q-tree
            :nodes="treeNodes"
            no-selection-unset
            node-key="id"
            selected-color="orange"
            v-model:selected="selectedNode"
            dense
            :filter="filter"
            @update:selected="
              (node) => {
                onNodeSelected(node);
              }
            "
          >
            <template v-slot:default-header="prop">
              <div class="row items-center">
                <q-icon
                  :name="prop.node.icon"
                  :color="prop.node.color"
                  size="20px"
                  class="q-mr-sm"
                />
                <div
                  :class="
                    prop.key === selectedNode
                      ? 'text-black text-bold'
                      : 'text-primary'
                  "
                >
                  {{ prop.node.label }}
                </div>
              </div>
            </template>
          </q-tree>
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-md">
          <device-details-component
            v-if="nodeSelected"
            :device="selectedDevice"
          />
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<style lang="css" scoped>
:deep(div.tree-container) {
  max-height: calc(100vh - 156px);
  min-height: calc(100vh - 156px);
  overflow-y: auto;
  padding-left: 6px;
  padding-right: 6px;
}
</style>

<script lang="ts">
import { PropType, onMounted, defineComponent, ref } from 'vue';
import _groupBy from 'lodash/groupBy';
import _orderBy from 'lodash/orderBy';

import DeviceDetailsComponent from './DeviceDetailsComponent.vue';
import * as serviceApi from '../service-api';
import { DeviceModel, TreeModel, WinRMPayload } from '../models';
import { QInput } from 'quasar';

export default defineComponent({
  name: 'DevicesComponent',
  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },

  components: {
    DeviceDetailsComponent,
  },

  methods: {
    onNodeSelected(id: string) {
      if (Number.isNaN(parseInt(id, 10))) {
        this.nodeSelected = false;
      } else {
        const device = this.data.find((d) => d.id === parseInt(id, 10));
        if (device) {
          this.selectedDevice = device;
          this.nodeSelected = true;
        }
      }
    },
  },

  setup(props) {
    const data = ref<DeviceModel[]>([]);
    const isLoading = ref(true);
    const treeNodes = ref<TreeModel[]>([]);
    const selectedNode = ref<string>('');
    const selectedDevice = ref<DeviceModel>({} as DeviceModel);
    const nodeSelected = ref(false);
    const filter = ref('');
    const filterRef = ref(null);

    onMounted(async () => {
      data.value = await serviceApi.getDevices(props.host);
      const res = _orderBy(data.value, ['class', 'caption'], ['asc', 'asc']);

      const grouped = _groupBy(res, 'class');
      for (const key in grouped) {
        const hasError =
          grouped[key].filter((d) => d.status !== 'OK').length > 0;
        treeNodes.value.push({
          label: key,
          icon: hasError ? 'nearby_error' : 'done',
          id: key,
          color: hasError ? 'warning' : 'green',
          children: grouped[key].map((d: DeviceModel) => {
            return {
              label: d.caption,
              icon: d.status === 'OK' ? 'done' : 'error',
              color: d.status === 'OK' ? 'green' : 'red',
              id: d.id.toString(),
            };
          }),
        });
      }
      isLoading.value = false;
    });

    const resetFilter = () => {
      filter.value = '';
      if (filterRef.value) {
        (filterRef.value as QInput).focus();
      }
    };

    return {
      data,
      isLoading,
      splitterModel: ref(75),
      treeNodes,
      selectedNode,
      selectedDevice,
      nodeSelected,
      filter,
      filterRef,
      resetFilter,
    };
  },
});
</script>
