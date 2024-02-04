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
      <system-info-component :system="model.system" :loading="isLoading" />
    </div>
    <div class="col-grow q-ma-sm">
      <logon-component :start-name="model.startName" :loading="isLoading" />
    </div>
    <div class="col-grow q-ma-sm">
      <summary-component
        :services="model.services"
        :drivers="model.drivers"
        :loading="isLoading"
      />
    </div>
    <div class="col-grow q-ma-sm">
      <critical-component :critical="model.critical" :loading="isLoading" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import _filter from 'lodash/filter';
import _groupBy from 'lodash/groupBy';
import _sortBy from 'lodash/sortBy';

import DCardComponent from './DCardComponent.vue';
import SystemInfoComponent from './SystemInfoComponent.vue';
import LogonComponent from './LogonComponent.vue';
import SummaryComponent from './SummaryComponent.vue';
import CriticalComponent from './CriticalComponent.vue';
import * as serviceApi from '../service-api';
import { ServiceModel, SystemModel, ServiceStatusModel } from '../models';

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
    SystemInfoComponent,
    LogonComponent,
    SummaryComponent,
    CriticalComponent,
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
