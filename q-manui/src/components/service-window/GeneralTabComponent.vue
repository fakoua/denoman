<template>
  <div class="div-form">
    <div class="text-caption text-primary">Service name:</div>
    <div class="q-mb-sm value">
      {{ service?.name }}
    </div>
    <div class="text-caption text-primary">Display name:</div>
    <div class="q-mb-sm value">
      {{ service?.caption }}
    </div>
    <div class="text-caption text-primary">Description:</div>
    <div class="q-mb-sm value description">
      {{ service?.description }}
    </div>
    <div class="text-caption text-primary">Path to executable:</div>
    <div class="q-mb-sm value path">
      {{ service?.pathName.replaceAll('|', '\\') }}
    </div>
    <q-separator class="q-mt-md q-mb-md" />
    <div class="inline">
      <div class="text-caption text-primary">Service status:</div>
      <div class="q-mb-sm value">
        <q-chip
          class="status"
          :color="getStateStyle(service?.state).color"
          text-color="white"
          :icon="getStateStyle(service?.state).icon"
        >
          {{ service?.state }}
        </q-chip>
      </div>
    </div>
    <div class="inline">
      <div class="text-caption text-primary">Log on as:</div>
      <div class="q-mb-sm value">
        {{ service?.startName }}
      </div>
    </div>
    <div class="footer q-gutter-sm">
      <q-separator />
      <q-btn
        @click="controlService('Start')"
        outline
        label="Start"
        size="10px"
        color="primary"
        :disable="service?.state !== 'Stopped'"
      />
      <q-btn
        outline
        @click="controlService('Stop')"
        label="Stop"
        size="10px"
        color="deep-orange"
        :disable="!service?.acceptStop"
      />
      <q-btn
        @click="controlService('Suspend')"
        outline
        label="Pause"
        size="10px"
        color="primary"
        :disable="!(service?.state === 'Running' && service?.acceptPause)"
      />
      <q-btn
        @click="controlService('Resume')"
        outline
        label="Resume"
        size="10px"
        color="primary"
        :disable="service?.state !== 'Paused'"
      />
      <q-btn
        @click="controlService('Restart')"
        outline
        label="Restart"
        size="10px"
        color="primary"
        :disable="service?.state !== 'Running'"
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
.status {
  font-size: 12px;
}
div.path {
  overflow-wrap: break-word;
}
div.description {
  max-height: 120px;
  overflow-y: auto;
}
div.inline > div {
  display: inline-block;
}
div.inline div.text-caption {
  width: 108px;
}
div.value {
  font-size: 13px;
  padding-left: 4px;
}
div.div-form {
  height: 460px !important;
}
div.footer {
  position: absolute;
  bottom: 10px;
}
</style>
<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { bus } from 'boot/bus';

import { ControlAction, ServiceModel } from '../models';

export default defineComponent({
  name: 'GeneralTabComponent',

  props: {
    service: {
      type: Object as PropType<ServiceModel>,
      required: false,
    },
  },

  methods: {
    async controlService(action: ControlAction) {
      bus.emit('controlService', {
        action: action,
        name: this.service?.name,
      });
    },
    getStateStyle(state: string | undefined) {
      if (state === 'Running') {
        return {
          color: 'teal',
          icon: 'check',
        };
      }
      if (state === 'Stopped') {
        return {
          color: 'red',
          icon: 'warning',
        };
      }
      return {
        color: 'grey',
        icon: 'sync_problem',
      };
    },
  },
  emits: ['onHideDialog', 'onShowDialog'],
  setup() {
    return {};
  },
});
</script>
