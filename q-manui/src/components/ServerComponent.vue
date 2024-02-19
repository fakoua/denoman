<template>
  <div class="container fit row wrap justify-start items-start content-start">
    <div class="s-left">
      <q-tabs v-model="tab" vertical>
        <q-tab name="dashboard" icon="dashboard" />
        <q-tab name="performance" icon="insights" />
        <q-tab name="services" icon="miscellaneous_services" />
        <q-tab name="terminal" icon="terminal" />
      </q-tabs>
    </div>
    <div class="s-right col-grow">
      <q-tab-panels v-model="tab" keep-alive keep-alive-include="performance">
        <q-tab-panel name="dashboard">
          <dashboard-component :host="host" />
        </q-tab-panel>
        <q-tab-panel name="performance">
          <perfmon-component :host="host" />
        </q-tab-panel>
        <q-tab-panel name="services" style="padding: 0">
          <q-splitter
            v-model="splitterModel"
            class="full-width-vw"
            separator-style="border: 1px solid white;"
          >
            <template v-slot:before>
              <div class="q-a-xl no-margin no-padding">
                <service-details-component
                  :service="selectedService"
                  :host="host"
                  v-on:on-open-service="
                    (svr: ServiceModel) => {
                      openService(svr);
                    }
                  "
                />
              </div>
            </template>

            <template v-slot:after>
              <div class="q-a-xl no-margin no-padding">
                <services-list-component
                  :host="host"
                  v-on:on-select-service="
                    (svr: ServiceModel) => {
                      selectedService = svr;
                    }
                  "
                  v-on:on-open-service="
                    (svr: ServiceModel) => {
                      openService(svr);
                    }
                  "
                />
              </div>
            </template>
          </q-splitter>
        </q-tab-panel>
        <q-tab-panel name="terminal">
          <terminal-component :host="host" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>

  <dialog id="serviceWindow" ref="serviceWindow" class="shadow-24">
    <header>
      <div class="fit row wrap justify-between items-start content-start">
        <div class="text-caption caption dialog-title">
          {{ doubleClickedService?.caption }}
        </div>
        <div class="overflow: auto;">
          <q-btn
            padding="xs"
            color="negative"
            icon="close"
            flat
            @click="
              () => {
                ($refs.serviceWindow as HTMLDialogElement).close();
                isDialogOpen = false;
              }
            "
          />
        </div>
      </div>
    </header>
    <service-window-component
      v-if="isDialogOpen"
      :service="doubleClickedService"
      :host="host"
    />
  </dialog>
</template>

<style lang="css" scoped>
div.s-left {
  overflow: auto;
  min-width: 50px;
  max-width: 50px;
}
div.s-right {
  overflow: hidden;
  width: calc(100vw - 70px);
  height: calc(100vh - 90px);
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}
.dialog-title {
  white-space: nowrap;
  overflow: hidden;
  max-width: 355px;
}
.left {
  border-right: 1px solid rgb(230, 229, 229);
}
/*   Open state of the dialog  */
dialog[open] {
  width: 400px;
  height: 565px !important;
  opacity: 1;
  transform: scaleY(1);
  animation: myFadeIn 0.5s ease normal;
}

dialog .caption {
  padding-left: 10px;
  line-height: 32px;
}
/*   Closed state of the dialog   */
dialog {
  height: 565px !important;
  border: none !important;
  padding: 0;
  opacity: 0;
  transform: scaleY(0);
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out,
    overlay 0.3s ease-out allow-discrete,
    display 0.3s ease-out allow-discrete;
}

/* Transition the :backdrop when the dialog modal is promoted to the top layer */
dialog::backdrop {
  background-color: rgb(0 0 0 / 0%);
  transition:
    display 0.3s allow-discrete,
    overlay 0.3s allow-discrete,
    background-color 0.3s;
}

dialog[open]::backdrop {
  background-color: rgb(0 0 0 / 25%);
}

@keyframes myFadeIn {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}
</style>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref } from 'vue';
import { bus } from 'boot/bus';

import ServicesListComponent from '../components/service-window/ServicesListComponent.vue';
import ServiceDetailsComponent from '../components/service-window/ServiceDetailsComponent.vue';
import ServiceWindowComponent from '../components/service-window/ServiceWindowComponent.vue';
import PerfmonComponent from '../components/performance/PerfmonComponent.vue';
import DashboardComponent from '../components/dashboard/DashboardComponent.vue';
import TerminalComponent from '../components/terminal/TerminalComponent.vue';

import { ServiceModel, WinRMPayload } from './models';

export default defineComponent({
  name: 'ServerComponent',
  components: {
    ServicesListComponent,
    ServiceDetailsComponent,
    ServiceWindowComponent,
    DashboardComponent,
    PerfmonComponent,
    TerminalComponent,
  },
  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },
  methods: {
    openService(service: ServiceModel) {
      this.doubleClickedService = service;
      this.isDialogOpen = true;
      (this.$refs.serviceWindow as HTMLDialogElement).showModal();
    },
  },

  setup() {
    const doubleClickedService = ref<ServiceModel | undefined>(undefined);
    const selectedService = ref<ServiceModel | undefined>(undefined);
    const isDialogOpen = ref(false);
    const serviceWindow = ref<HTMLDialogElement | null>(null);

    onMounted(async () => {
      bus.on('controlService', async () => {
        if (isDialogOpen.value) {
          //(serviceWindow.value as HTMLDialogElement).close();
          if (serviceWindow.value) {
            serviceWindow.value.close();
          }
        }
      });
      bus.on('serviceChanged', (service) => {
        selectedService.value = service;
        if (isDialogOpen.value) {
          doubleClickedService.value = service;
          serviceWindow.value?.showModal();
        }
      });
    });
    return {
      selectedService: selectedService,
      doubleClickedService,
      splitterModel: ref(15),
      services: ref<Array<ServiceModel>>([]),
      isDialogOpen: isDialogOpen,
      serviceWindow,
      tab: ref('dashboard'),
    };
  },
});
</script>
