<template>
  <div v-if="isLoading">
    <q-linear-progress v-if="isLoading" indeterminate />
  </div>
  <div
    v-if="!isLoading"
    class="fit row wrap justify-start items-start content-start"
  >
    <div
      style="
        overflow: auto;
        min-width: 32px;
        max-width: 32px;
        margin-right: 10px;
      "
    >
      <q-btn
        size="sm"
        color="primary"
        icon="settings"
        flat
        round
        @click="openService()"
      />
      <q-btn
        v-if="!disableStart"
        size="sm"
        color="primary"
        icon="play_arrow"
        flat
        round
        @click="controlService('Start')"
      />
      <q-btn
        v-if="!disableStop"
        size="sm"
        color="primary"
        icon="stop"
        flat
        round
        @click="controlService('Stop')"
      />
      <q-btn
        v-if="!disablePause"
        size="sm"
        color="primary"
        icon="pause"
        flat
        round
        @click="controlService('Suspend')"
      />
      <q-btn
        v-if="!disableResume"
        size="sm"
        color="primary"
        icon="motion_photos_paused"
        flat
        round
        @click="controlService('Resume')"
      />
      <q-btn
        v-if="!disableRestart"
        size="sm"
        color="primary"
        icon="replay"
        flat
        round
        @click="controlService('Restart')"
      />
    </div>
    <div style="overflow: auto; min-width: 400px; max-width: 400px">
      <div class="text-weight-bold">Dependencies:</div>
      <div v-if="dependencies.length === 0" class="no-deps">
        No Dependencies
      </div>
      <q-list dense class="deps-list">
        <q-item v-for="d in dependencies" :key="d.name">
          <q-item-section avatar>
            <q-icon :class="d.cls" :name="d.icon" size="20px" />
          </q-item-section>
          <q-item-section style="font-size: 11px">
            {{ d.caption }}
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div style="overflow: auto; min-width: 400px; max-width: 400px">
      <div class="text-weight-bold">Dependents:</div>
      <div v-if="dependents.length === 0" class="no-deps">No Dependents</div>
      <q-list dense class="deps-list">
        <q-item v-for="d in dependents" :key="d.name">
          <q-item-section avatar>
            <q-icon :class="d.cls" :name="d.icon" size="20px" />
          </q-item-section>
          <q-item-section> {{ d.caption }} </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<style lang="css" scoped>
.no-deps {
  font-size: 11px;
  color: #ccc;
}
.deps-list {
  max-height: 200px;
  overflow: auto;
}
.q-item__section--avatar {
  padding: 0;
  min-width: 22px;
}
.service-running {
  color: green;
}
.service-stopped {
  color: red;
}
.q-item.q-item-type.row {
  padding: 4px;
  border-left: 1px solid #ccc;
  margin-left: 4px;
}
</style>

<script lang="ts">
import { PropType, computed, defineComponent, onMounted, ref } from 'vue';

import * as serviceApi from '../service-api';
import {
  ControlAction,
  DependenciesModel,
  ServiceModel,
  WinRMPayload,
} from '../models';

type Deps = {
  caption?: string;
  name?: string;
  icon?: string;
  state?: string;
  cls?: string;
};

export default defineComponent({
  name: 'DependenciesRowComponent',

  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
    service: {
      type: Object as PropType<ServiceModel>,
      required: false,
    },
  },
  emits: ['controlService', 'openService'],
  methods: {
    controlService(action: ControlAction) {
      this.$emit('controlService', action);
    },
    openService() {
      this.$emit('openService');
    },
  },
  setup(props) {
    const isLoading = ref(true);
    const dependencies = ref<Deps[]>([]);
    const dependents = ref<Deps[]>([]);

    const getDependencies = async (name: string): Promise<Deps[]> => {
      const services = await serviceApi.getServices(props.host);
      const deps = await serviceApi.getDependencies(props.host);
      if (services && deps) {
        const dependsOn: Array<DependenciesModel> = deps.filter(
          (v: DependenciesModel) => {
            return v.dependent == name;
          },
        );

        return dependsOn.map((v) => {
          const svr = (services).find(
            (s: ServiceModel) => s.name == v.antecedent,
          );
          return {
            caption: svr?.caption,
            name: v.antecedent,
            icon: svr?.isSystemDriver ? 'usb' : 'settings_suggest',
            cls:
              svr?.state === 'Running' ? 'service-running' : 'service-stopped',
            state: svr?.state,
          };
        });
      }
      return [];
    };

    const getDependents = async (name: string): Promise<Deps[]> => {
      const services = await serviceApi.getServices(props.host);
      const deps = await serviceApi.getDependencies(props.host);
      if (services && deps) {
        const antecedentsOn: Array<DependenciesModel> = deps.filter(
          (v: DependenciesModel) => {
            return v.antecedent == name;
          },
        );

        return antecedentsOn.map((v) => {
          const svr = (services).find(
            (s: ServiceModel) => s.name == v.dependent,
          );
          return {
            caption: svr?.caption,
            name: v.dependent,
            lazy: true,
            icon: svr?.isSystemDriver ? 'usb' : 'settings_suggest',
            cls:
              svr?.state === 'Running' ? 'service-running' : 'service-stopped',
            state: svr?.state,
          };
        });
      }
      return [];
    };

    const disableStart = computed(() => {
      if (!props.service) {
        return true;
      }
      return props.service.state !== 'Stopped';
    });

    const disableStop = computed(() => {
      if (!props.service) {
        return true;
      }
      return !props.service.acceptStop;
    });

    const disablePause = computed(() => {
      if (!props.service) {
        return true;
      }
      return !(
        props.service.state === 'Running' && props.service.acceptPause
      );
    });

    const disableResume = computed(() => {
      if (!props.service) {
        return true;
      }
      return props.service.state !== 'Paused';
    });

    const disableRestart = computed(() => {
      if (!props.service) {
        return true;
      }
      return props.service.state !== 'Running';
    });

    onMounted(async () => {
      if (props.service) {
        dependencies.value = await getDependencies(props.service.name);
        dependents.value = await getDependents(props.service.name);
      }
      isLoading.value = false;
    });

    return {
      isLoading,
      dependencies,
      dependents,
      disableStart,
      disableStop,
      disablePause,
      disableResume,
      disableRestart,
    };
  },
});
</script>
