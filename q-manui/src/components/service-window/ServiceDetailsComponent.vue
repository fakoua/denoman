<template>
  <div class="container column justify-between">
    <div>
      <div v-if="!service" class="text-weight-bold text-primary mb-12">
        Select a service
      </div>
      <div v-if="!service">
        <q-skeleton
          type="QBtn"
          animation="none"
          style="width: 76px; height: 28px"
        />
        <q-skeleton type="text" animation="none" width="75%" />
        <q-skeleton type="text" animation="none" />
        <br />
        <q-skeleton type="text" animation="none" width="65%" />
        <q-skeleton type="rect" animation="none" height="40px" />
      </div>
      <div v-if="service">
        <div class="text-weight-bold text-primary mb-12">
          {{ service.caption }}
        </div>
        <div>
          <q-btn outline size="sm" color="primary" label="Actions">
            <q-menu
              transition-show="jump-down"
              transition-hide="jump-up"
              auto-close
            >
              <q-list dense style="min-width: 120px">
                <q-item
                  clickable
                  @click="controlService('Start')"
                  :disable="service?.state !== 'Stopped'"
                >
                  <q-item-section avatar class="q-item-section-item">
                    <q-icon name="play_arrow" size="20px" />
                  </q-item-section>
                  <q-item-section>Start</q-item-section>
                </q-item>
                <q-item
                  clickable
                  @click="controlService('Stop')"
                  :disable="!service?.acceptStop"
                >
                  <q-item-section avatar class="q-item-section-item">
                    <q-icon name="stop" size="20px" />
                  </q-item-section>
                  <q-item-section>Stop</q-item-section>
                </q-item>
                <q-item
                  clickable
                  @click="controlService('Suspend')"
                  :disable="
                    !(service?.state === 'Running' && service?.acceptPause)
                  "
                >
                  <q-item-section avatar class="q-item-section-item">
                    <q-icon name="pause" size="20px" />
                  </q-item-section>
                  <q-item-section>Pause</q-item-section>
                </q-item>
                <q-item
                  clickable
                  @click="controlService('Resume')"
                  :disable="service?.state !== 'Paused'"
                >
                  <q-item-section avatar class="q-item-section-item">
                    <q-icon name="motion_photos_paused" size="20px" />
                  </q-item-section>
                  <q-item-section>Resume</q-item-section>
                </q-item>
                <q-item
                  clickable
                  @click="controlService('Restart')"
                  :disable="service?.state !== 'Running'"
                >
                  <q-item-section avatar class="q-item-section-item">
                    <q-icon name="replay" size="20px" />
                  </q-item-section>
                  <q-item-section>Restart</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="openService()">
                  <q-item-section avatar class="q-item-section-item">
                    <q-icon name="folder_open" size="20px" />
                  </q-item-section>
                  <q-item-section>Details</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <div class="text-weight-bold mt-12">Path to executable:</div>
        <div class="mb-12 div-path-name">
          {{ service.pathName.replaceAll('|', '\\') }}
        </div>
        <div class="text-weight-bold">Description:</div>
        <div>
          {{ service.description }}
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="div-system text-weight-bolder">System</div>
      <div v-if="isLoading">
        <q-spinner-ball color="primary" size="2em" />
      </div>
      <div v-if="!isLoading" class="sub-fotter">
        <div class="text-weight-bold">{{ data.csName }}</div>
        <div class="mb-12 div-windows">
          {{ data.caption }} ({{ data.osArchitecture }})
        </div>
        <div class="div-windows">{{ data.processorName }}</div>
        <div class="div-windows">{{ data.memory }} RAM</div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.q-item-section-item {
  padding-right: 0px;
  min-width: 30px;
}
.container {
  padding: 16px;
  height: calc(100vh - 90px);
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
.mb-12 {
  margin-bottom: 12px;
}
.mt-12 {
  margin-top: 12px;
}
.footer {
  overflow: auto;
  height: 160px;
  position: absolute;
  bottom: 0;
}
.sub-fotter {
  overflow: auto;
  height: 120px;
}
.div-system {
  border-bottom: 2px solid #1976d2;
  color: #1976d2;
  margin-bottom: 12px;
}
.div-windows {
  font-size: 11px;
  font-weight: 600;
}
.div-path-name {
  overflow-wrap: anywhere;
}
</style>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import { getSystemInformation } from '../service-api';

import {
  ControlAction,
  ServiceModel,
  SystemModel,
  WinRMPayload,
} from '../models';
import { bus } from 'boot/bus';

export default defineComponent({
  name: 'ServiceDetailsComponent',

  props: {
    service: {
      type: Object as PropType<ServiceModel>,
      required: false,
    },
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },

  methods: {
    openService() {
      this.$emit('onOpenService', this.service);
    },
    async controlService(action: ControlAction) {
      bus.emit(`${this.host.hostname}:controlService`, {
        action: action,
        name: this.service?.name,
      });
    },
  },

  emits: ['onOpenService'],

  setup(props) {
    const data = ref<SystemModel>({} as SystemModel);

    const isLoading = ref(true);
    getSystemInformation(props.host)
      .then((response) => {
        data.value = response;
      })
      .catch(() => {
        console.log('error');
      })
      .finally(() => {
        isLoading.value = false;
      });

    return {
      data,
      isLoading,
    };
  },
});
</script>
