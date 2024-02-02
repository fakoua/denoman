<template>
  <div class="full-width row justify-between">
    <d-card-component
      icon="play_circle_filled"
      class="bg-light-green text-white"
      :value="model.services.running?.toString()"
      caption="Running services"
      :loading="isLoading"
    />
    <d-card-component
      icon="stop_circle"
      class="bg-red-9 text-white"
      :value="model.services.stopped?.toString()"
      caption="Stopped services"
      :loading="isLoading"
    />
    <d-card-component
      icon="motion_photos_auto"
      class="bg-indigo-6 text-white"
      :value="model.services.automatic?.toString()"
      caption="Automatic services"
      :loading="isLoading"
    />
    <d-card-component
      icon="fiber_manual_record"
      class="bg-grey-5 text-white"
      :value="model.services.manual?.toString()"
      caption="Manual services"
      :loading="isLoading"
    />
  </div>
  <div class="full-width row justify-between">
    <div class="col-grow q-ma-sm" style="max-width: 437px">
      <q-card flat bordered style="min-height: 268px">
        <q-card-section class="text-indigo-6">
          <div class="text-h6">System</div>
          <div class="text-weight-thin">System Information</div>
        </q-card-section>
        <q-list bordered>
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="laptop_windows" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ model.system?.csName }}</q-item-label>
              <q-item-label caption lines="2" style="font-size: 11px">{{
                model.system?.caption
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="storage" />
            </q-item-section>

            <q-item-section style="font-size: 12px"
              >{{ model.system?.processorName }} ({{
                model.system?.osArchitecture
              }})</q-item-section
            >
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="memory" />
            </q-item-section>

            <q-item-section>{{ model.system?.memory }} RAM</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
    <div class="col-grow q-ma-sm">
      <q-card flat bordered>
        <q-card-section class="text-blue-6">
          <div class="text-h6">Logon as</div>
          <div class="text-weight-thin">Logon distribution</div>
        </q-card-section>
        <div class="critical-table">
          <q-markup-table dense flat>
            <tbody>
              <tr>
                <td class="text-weight-bold">Logon</td>
                <td class="text-weight-bold">Count</td>
              </tr>
              <tr v-for="item in model.startName" :key="item[0]">
                <td>
                  {{ item[0] }}
                </td>
                <td class="text-right">
                  {{ item[1] }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </q-card>
    </div>
    <div class="col-grow q-ma-sm">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Summary</div>
          <div class="text-weight-thin">
            {{ (model.services.total ?? 0) + (model.drivers.total ?? 0) }} total
            services &amp; drivers
          </div>
        </q-card-section>

        <q-markup-table dense>
          <tbody>
            <tr>
              <td class="text-left"></td>
              <td class="text-right text-weight-bold">Services</td>
              <td class="text-right text-weight-bold">Drivers</td>
            </tr>
            <tr>
              <td class="text-left text-light-green">Running</td>
              <td class="text-right text-light-green">
                {{ model.services.running }}
              </td>
              <td class="text-right text-light-green">
                {{ model.drivers.running }}
              </td>
            </tr>
            <tr>
              <td class="text-left text-red-9">Stopped</td>
              <td class="text-right text-red-9">
                {{ model.services.stopped }}
              </td>
              <td class="text-right text-red-9">{{ model.drivers.stopped }}</td>
            </tr>
            <tr>
              <td class="text-left text-indigo-6">Automatic</td>
              <td class="text-right text-indigo-6">
                {{ model.services.automatic }}
              </td>
              <td class="text-right text-indigo-6">
                {{ model.drivers.automatic }}
              </td>
            </tr>
            <tr>
              <td class="text-left text-grey-5">Manual</td>
              <td class="text-right text-grey-5">
                {{ model.services.manual }}
              </td>
              <td class="text-right text-grey-5">{{ model.drivers.manual }}</td>
            </tr>
            <tr>
              <td class="text-left text-weight-bold">Total</td>
              <td class="text-right">{{ model.services.total }}</td>
              <td class="text-right">{{ model.drivers.total }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </div>
    <div class="col-grow q-ma-sm">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 text-red-6">
            <q-icon name="notification_important" />
            Critical
          </div>
          <div class="text-weight-thin text-red-3">
            Automatic services & not running
          </div>
        </q-card-section>
        <div class="critical-table">
          <q-markup-table dense flat>
            <tbody>
              <tr v-for="s in model.critical" :key="s.name">
                <td class="text-red-9">
                  <q-icon name="sync_problem" /> {{ s.caption }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </q-card>
    </div>
  </div>
</template>

<style lang="css" scoped>
.critical-table {
  overflow-y: auto;
  max-height: 172px;
}
</style>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import _filter from 'lodash/filter';
import _groupBy from 'lodash/groupBy';
import _sortBy from 'lodash/sortBy';

import DCardComponent from './DCardComponent.vue';
import * as serviceApi from '../service-api';
import { ServiceModel, SystemModel } from '../models';

type ServiceStatusModel = {
  running?: number;
  stopped?: number;
  automatic?: number;
  manual?: number;
  total?: number;
};

type DashboardModel = {
  services: ServiceStatusModel;
  drivers: ServiceStatusModel;
  critical: ServiceModel[] | undefined;
  system?: SystemModel;
  startName: [login: string, count: number][];
};

export default defineComponent({
  name: 'DashboardComponent',
  components: {
    DCardComponent,
  },

  setup() {
    const model = ref<DashboardModel>({
      services: {},
      drivers: {},
      critical: [],
      startName: [],
    });
    const isLoading = ref(true);
    const loadServices = async (): Promise<ServiceModel[] | undefined> => {
      const res = await serviceApi.getServices();
      return res;
    };

    const loadSystem = async (): Promise<SystemModel> => {
      const res = await serviceApi.getSystemInformation();
      return res;
    };

    loadServices()
      .then((res) => {
        model.value.services.running = _filter(res, {
          isSystemDriver: false,
          state: 'Running',
        }).length;

        model.value.services.stopped = _filter(res, {
          isSystemDriver: false,
          state: 'Stopped',
        }).length;

        model.value.services.automatic = _filter(res, {
          isSystemDriver: false,
          startMode: 'Auto',
        }).length;

        model.value.services.manual = _filter(res, {
          isSystemDriver: false,
          startMode: 'Manual',
        }).length;

        model.value.services.total = _filter(res, {
          isSystemDriver: false,
        }).length;

        model.value.drivers.running = _filter(res, {
          isSystemDriver: true,
          state: 'Running',
        }).length;

        model.value.drivers.stopped = _filter(res, {
          isSystemDriver: true,
          state: 'Stopped',
        }).length;

        model.value.drivers.automatic = _filter(res, {
          isSystemDriver: true,
          startMode: 'Auto',
        }).length;

        model.value.drivers.manual = _filter(res, {
          isSystemDriver: true,
          startMode: 'Manual',
        }).length;

        model.value.drivers.total = _filter(res, {
          isSystemDriver: true,
        }).length;

        model.value.critical = res?.filter((v) => {
          return v.state !== 'Running' && v.startMode === 'Auto';
        });

        const startNameGroup = _groupBy(res, (s) => {
          return s.startName.toLocaleLowerCase();
        });

        for (let key in startNameGroup) {
          let startName = key.replaceAll('|', '\\');
          if (startName === '') {
            startName = '[No Login]';
          }
          model.value.startName.push([startName, startNameGroup[key].length]);
        }
        model.value.startName = _sortBy(model.value.startName, [1]).reverse();
      })
      .finally(() => {
        isLoading.value = false;
      });

    loadSystem().then((res) => {
      model.value.system = res;
    });

    return {
      model,
      isLoading,
    };
  },
});
</script>
