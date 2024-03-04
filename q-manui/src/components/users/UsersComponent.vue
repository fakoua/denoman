<template>
  <q-table
    bordered
    square
    :rows="users"
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
        <q-td
          :style="cellTextColor(props.row)"
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
        >
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
            <user-details-component :user="props.row" />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref } from 'vue';
import UserDetailsComponent from './UserDetailsComponent.vue';

import { ExpandedRowProps, UserModel, WinRMPayload } from '../models';
import * as api from '../service-api';
import { QTableColumn } from 'quasar';

const columns: QTableColumn[] = [
  {
    name: 'name',
    label: 'User',
    field: 'name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'fullName',
    label: 'Name',
    field: 'fullName',
    sortable: true,
    align: 'left',
  },
  {
    name: 'enabled',
    label: 'Active',
    field: 'enabled',
    sortable: true,
    align: 'left',
    format: (val: boolean) => (val ? 'Yes' : ''),
  },
  {
    name: 'lastLogon',
    label: 'Last Logon',
    field: 'lastLogon',
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
  name: 'UsersComponent',
  components: {
    UserDetailsComponent,
  },
  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },
  methods: {
    onSelect(row: UserModel) {
      this.selected = [row];
    },
    cellTextColor(row: UserModel) {
      return row.enabled ? 'color:black;' : 'color:red;';
    },
  },

  setup(props) {
    const users = ref<UserModel[]>([]);
    const isLoading = ref(true);
    const pagination = ref({ sortBy: 'name', descending: false });
    const selected = ref([] as UserModel[]);
    const expendedRowProps = ref<ExpandedRowProps>({
      expand: false,
      rowIndex: -1,
    });

    onMounted(async () => {
      users.value = await api.getUsers(props.host);
      isLoading.value = false;
    });
    return {
      users,
      columns,
      isLoading,
      pagination,
      selected,
      expendedRowProps,
    };
  },
});
</script>
