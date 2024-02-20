<template>
  <div>
    <div class="q-gutter-y-md" style="max-width: 600px">
      <q-card flat>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="general" label="General" />
          <q-tab name="dependencies" label="Dependencies" />
          <q-tab name="performance" label="Performance" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="general">
            <general-tab-component
              :service="service"
              :host="host"
              v-on:on-hide-dialog="$emit('onHideDialog')"
              v-on:on-show-dialog="
                (svr) => {
                  $emit('onShowDialog', svr);
                }
              "
            />
          </q-tab-panel>

          <q-tab-panel name="dependencies">
            <dependencies-tab-component :service="service" :host="host" />
          </q-tab-panel>

          <q-tab-panel name="performance"> Not Implemented </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';

import { ServiceModel, WinRMPayload } from '../models';
import GeneralTabComponent from './GeneralTabComponent.vue';
import DependenciesTabComponent from './DependenciesTabComponent.vue';

export default defineComponent({
  name: 'ServiceWindowComponent',
  components: { GeneralTabComponent, DependenciesTabComponent },

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

  methods: {},
  emits: ['onHideDialog', 'onShowDialog'],
  setup() {
    return {
      tab: ref('general'),
      text: ref('asdfasdf'),
    };
  },
});
</script>
