<template>
  <div class="container fit row wrap justify-start items-start content-start">
    <div class="s-left">
      <q-list dense padding class="rounded-borders">
        <q-item
          clickable
          v-ripple
          :active="tab === 'dashboard'"
          @click="tab = 'dashboard'"
          :inset-level="0"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="dashboard" />
          </q-item-section>
          <q-item-section> Dashboard </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="tab === 'performance'"
          @click="tab = 'performance'"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="insights" />
          </q-item-section>
          <q-item-section> Performance </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="tab === 'services'"
          @click="tab = 'services'"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="miscellaneous_services" />
          </q-item-section>
          <q-item-section> Services </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          :active="tab === 'processes'"
          @click="tab = 'processes'"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="format_list_bulleted" />
          </q-item-section>
          <q-item-section> Processes </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          :active="tab === 'users'"
          @click="tab = 'users'"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="people" />
          </q-item-section>
          <q-item-section> Users & Groups </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          :active="tab === 'devices'"
          @click="tab = 'devices'"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="bluetooth_audio" />
          </q-item-section>
          <q-item-section> Devices </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          :active="tab === 'terminal'"
          @click="tab = 'terminal'"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="terminal" />
          </q-item-section>
          <q-item-section> Terminal </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="s-right col-grow">
      <q-tab-panels v-model="tab" keep-alive keep-alive-include="performance">
        <q-tab-panel name="dashboard" style="padding: 0">
          <dashboard-component :host="host" />
        </q-tab-panel>
        <q-tab-panel name="performance" style="padding: 0">
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
        <q-tab-panel name="processes" style="padding: 0">
          <processes-component :host="host" />
        </q-tab-panel>
        <q-tab-panel name="users" style="padding: 0">
          <users-groups-component :host="host" />
        </q-tab-panel>
        <q-tab-panel name="devices" style="padding: 0">
          <devices-component :host="host" />
        </q-tab-panel>
        <q-tab-panel name="terminal" style="padding: 0">
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
.q-item__section--avatar {
  min-width: 26px;
  padding-right: 0;
}
.q-item__section--avatar .material-icons {
  font-size: 18px;
}

div.s-left {
  padding-top: 0;
  overflow: auto;
  min-width: 200px;
  max-width: 200px;
}
div.s-right {
  overflow: hidden;
  width: calc(100vw - 220px);
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
import ProcessesComponent from '../components/processes/ProcessesComponent.vue';
import DevicesComponent from '../components/devices/DevicesComponent.vue';
import TerminalComponent from '../components/terminal/TerminalComponent.vue';
import UsersGroupsComponent from '../components/users/UsersGroupsComponent.vue';

import { ServiceModel, WinRMPayload } from './models';

export default defineComponent({
  name: 'ServerComponent',
  components: {
    ServicesListComponent,
    ServiceDetailsComponent,
    ServiceWindowComponent,
    DashboardComponent,
    PerfmonComponent,
    ProcessesComponent,
    TerminalComponent,
    DevicesComponent,
    UsersGroupsComponent,
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

  setup(props) {
    const doubleClickedService = ref<ServiceModel | undefined>(undefined);
    const selectedService = ref<ServiceModel | undefined>(undefined);
    const isDialogOpen = ref(false);
    const serviceWindow = ref<HTMLDialogElement | null>(null);

    onMounted(async () => {
      bus.on(`${props.host.hostname}:controlService`, async () => {
        if (isDialogOpen.value) {
          if (serviceWindow.value) {
            serviceWindow.value.close();
          }
        }
      });
      bus.on(`${props.host.hostname}:serviceChanged`, (service) => {
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
      services: ref<ServiceModel[]>([]),
      isDialogOpen: isDialogOpen,
      serviceWindow,
      tab: ref('dashboard'),
    };
  },
});
</script>
