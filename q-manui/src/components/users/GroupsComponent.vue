<template>
  <q-table
    bordered
    square
    :rows="groups"
    :columns="columns"
    color="primary"
    row-key="name"
    selection="single"
    v-model:selected="selected"
    :loading="isLoading"
    dense
    flat
    :rows-per-page-options="[0]"
    v-model:pagination="pagination"
    class="my-sticky-header-table"
    separator="cell"
    wrap-cells
    style="height: calc(100vh - 110px)"
  >
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
            v-if="col.name === 'name'"
            size="sm"
            flat
            dense
            :icon="props.expand ? 'expand_less' : 'expand_more'"
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
          />
          {{ col.value }}
        </q-td>
      </q-tr>
      <q-tr v-if="props.expand" v-show="props.expand" :props="props">
        <q-td colspan="100%" style="padding-left: 6px; background-color: white">
          <div class="text-left">
            <group-details-component :group="props.row" />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref } from 'vue';
import GroupDetailsComponent from './GroupDetailsComponent.vue';

import { ExpandedRowProps, GroupModel, WinRMPayload } from '../models';
import * as api from '../service-api';
import { QTableColumn } from 'quasar';

const columns: QTableColumn[] = [
  {
    name: 'name',
    label: 'Group',
    field: 'name',
    sortable: true,
    align: 'left',
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
  name: 'GroupsComponent',
  components: {
    GroupDetailsComponent,
  },
  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },
  methods: {
    onSelect(row: GroupModel) {
      this.selected = [row];
    },
  },

  setup(props) {
    const groups = ref<GroupModel[]>([]);
    const isLoading = ref(true);
    const pagination = ref({ sortBy: 'name', descending: false });
    const selected = ref([] as GroupModel[]);
    const expendedRowProps = ref<ExpandedRowProps>({
      expand: false,
      rowIndex: -1,
    });

    onMounted(async () => {
      groups.value = await api.getGroups(props.host);
      isLoading.value = false;
    });
    return {
      groups,
      columns,
      isLoading,
      pagination,
      selected,
      expendedRowProps,
    };
  },
});
</script>
