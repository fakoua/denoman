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
  <div class="full-width row justify-between">
    <div class="col-grow q-ma-sm">
      <top-dependency-component :loading="isLoading" :deps="model.topDeps" />
    </div>
    <div class="col-grow q-ma-sm">
      <service-type-component :loading="isLoading" :types="model.types" />
    </div>

    <div class="col-grow q-ma-sm">
      <service-type-component :loading="isLoading" :types="model.types" />
    </div>
    <div class="col-grow q-ma-sm">
      <service-type-component :loading="isLoading" :types="model.types" />
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref } from 'vue';
import _filter from 'lodash/filter';
import _groupBy from 'lodash/groupBy';
import _sortBy from 'lodash/sortBy';
import _take from 'lodash/take';

import DCardComponent from './DCardComponent.vue';
import SystemInfoComponent from './SystemInfoComponent.vue';
import LogonComponent from './LogonComponent.vue';
import SummaryComponent from './SummaryComponent.vue';
import CriticalComponent from './CriticalComponent.vue';
import TopDependencyComponent from './TopDependencyComponent.vue';
import ServiceTypeComponent from './ServiceTypeComponent.vue';

import * as serviceApi from '../service-api';
import {
  ServiceModel,
  SystemModel,
  ServiceStatusModel,
  DependenciesModel,
  WinRMPayload,
} from '../models';

type DashboardModel = {
  services: ServiceStatusModel;
  drivers: ServiceStatusModel;
  critical: ServiceModel[] | undefined;
  system?: SystemModel;
  startName: [login: string, count: number][];
  topDeps: [service: string, count: number][];
  types?: [type: string, count: number][];
};

export default defineComponent({
  name: 'DashboardComponent',
  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },
  components: {
    DCardComponent,
    SystemInfoComponent,
    LogonComponent,
    SummaryComponent,
    CriticalComponent,
    TopDependencyComponent,
    ServiceTypeComponent,
  },

  setup(props) {
    const model = ref<DashboardModel>({
      services: {},
      drivers: {},
      critical: [],
      startName: [],
      topDeps: [],
    });
    const isLoading = ref(true);

    const processServices = (services: ServiceModel[]) => {
      model.value.services.running = _filter(services, {
        isSystemDriver: false,
        state: 'Running',
      }).length;

      model.value.services.stopped = _filter(services, {
        isSystemDriver: false,
        state: 'Stopped',
      }).length;

      model.value.services.automatic = _filter(services, {
        isSystemDriver: false,
        startMode: 'Auto',
      }).length;

      model.value.services.manual = _filter(services, {
        isSystemDriver: false,
        startMode: 'Manual',
      }).length;

      model.value.services.total = _filter(services, {
        isSystemDriver: false,
      }).length;

      model.value.drivers.running = _filter(services, {
        isSystemDriver: true,
        state: 'Running',
      }).length;

      model.value.drivers.stopped = _filter(services, {
        isSystemDriver: true,
        state: 'Stopped',
      }).length;

      model.value.drivers.automatic = _filter(services, {
        isSystemDriver: true,
        startMode: 'Auto',
      }).length;

      model.value.drivers.manual = _filter(services, {
        isSystemDriver: true,
        startMode: 'Manual',
      }).length;

      model.value.drivers.total = _filter(services, {
        isSystemDriver: true,
      }).length;

      model.value.critical = services?.filter((v) => {
        return v.state !== 'Running' && v.startMode === 'Auto';
      });

      const startNameGroup = _groupBy(services, (s) => {
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

      const serviceType = _groupBy(services, (s) => {
        return s.serviceType;
      });
      model.value.types = [];
      for (let key in serviceType) {
        model.value.types.push([key, serviceType[key].length]);
      }
      model.value.types = _sortBy(model.value.types, [1]).reverse();
    };

    const processDependencies = (
      services: ServiceModel[],
      dependencies: DependenciesModel[]
    ) => {
      const grp = _groupBy(dependencies, (s) => {
        return s.antecedent;
      });
      let lst: [service: string, count: number][] = [];

      for (let key in grp) {
        lst.push([key, grp[key].length]);
      }

      lst = _take(_sortBy(lst, [1]).reverse(), 5);

      lst.forEach((dep) => {
        dep[0] = services.find((s) => s.name === dep[0])?.displayName || dep[0];
      });
      model.value.topDeps = lst;
    };

    const loadServices = async (): Promise<ServiceModel[] | undefined> => {
      const res = await serviceApi.getServices(props.host);
      return res;
    };

    const loadSystem = async (): Promise<SystemModel> => {
      const res = await serviceApi.getSystemInformation(props.host);
      return res;
    };

    const loadDependencies = async (): Promise<
      DependenciesModel[] | undefined
    > => {
      const res = await serviceApi.getDependencies(props.host);
      return res;
    };

    onMounted(async () => {
      const services = await loadServices();
      if (services) {
        processServices(services);
      }

      model.value.system = await loadSystem();

      const deps = await loadDependencies();

      if (deps && services) {
        processDependencies(services, deps);
      }

      isLoading.value = false;
    });

    return {
      model,
      isLoading,
    };
  },
});
</script>
