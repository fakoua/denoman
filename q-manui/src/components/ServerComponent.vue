<template>
  <div class="container fit row wrap justify-start items-start content-start">
    <div class="s-left">
      <q-tabs v-model="tab" vertical>
        <q-tab name="dashboard" icon="dashboard" />
        <q-tab name="services" icon="miscellaneous_services" />
      </q-tabs>
    </div>
    <div class="s-right col-grow">
      <q-tab-panels v-model="tab">
        <q-tab-panel name="dashboard">
          <dashboard-component />
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
                  v-on:on-open-service="
            (svr: ServiceType) => {
              openService(svr);
            }
          "
                />
              </div>
            </template>

            <template v-slot:after>
              <div class="q-a-xl no-margin no-padding">
                <services-list-component
                  v-on:on-select-service="
            (svr: ServiceType) => {
              selectedService = svr;
            }
          "
                  v-on:on-open-service="
            (svr: ServiceType) => {
              openService(svr);
            }
          "
                />
              </div>
            </template>
          </q-splitter>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>

  <dialog id="serviceWindow" ref="serviceWindow" class="shadow-24">
    <header>
      <div class="fit row wrap justify-between items-start content-start">
        <div class="text-caption caption dialog-title">
          {{ doubleClickedService.data?.caption }}
        </div>
        <div class="overflow: auto;">
          <q-btn
            padding="xs"
            color="negative"
            icon="close"
            flat
            @click="() => {
          ($refs.serviceWindow as HTMLDialogElement).close();
          isDialogOpen=false;
        }"
          />
        </div>
      </div>
    </header>
    <service-window-component
      v-if="isDialogOpen"
      :service="doubleClickedService"
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
  height: calc(100vh - 100px);
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}
.dialog-title {
  white-space: nowrap;
  overflow: hidden;
  max-width: 355px;
}
.full-width-vw {
  /*width: 100vw !important;*/
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
  transition: opacity 0.3s ease-out, transform 0.3s ease-out,
    overlay 0.3s ease-out allow-discrete, display 0.3s ease-out allow-discrete;
  /* Equivalent to
  transition: all 0.7s allow-discrete; */
}

/*   Before-open state  */
/* Needs to be after the previous dialog[open] rule to take effect,
    as the specificity is the same */
@starting-style {
  dialog[open] {
    opacity: 0;
    transform: scaleY(0);
  }
}

/* Transition the :backdrop when the dialog modal is promoted to the top layer */
dialog::backdrop {
  background-color: rgb(0 0 0 / 0%);
  transition: display 0.3s allow-discrete, overlay 0.3s allow-discrete,
    background-color 0.3s;
  /* Equivalent to
  transition: all 0.7s allow-discrete; */
}

dialog[open]::backdrop {
  background-color: rgb(0 0 0 / 25%);
}

/* This starting-style rule cannot be nested inside the above selector
because the nesting selector cannot represent pseudo-elements. */

@starting-style {
  dialog[open]::backdrop {
    background-color: rgb(0 0 0 / 0%);
  }
}
</style>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { bus } from 'boot/bus';

import ServicesListComponent from '../components/ServicesListComponent.vue';
import ServiceDetailsComponent from '../components/ServiceDetailsComponent.vue';
import ServiceWindowComponent from '../components/service-window/ServiceWindowComponent.vue';
import DashboardComponent from '../components/dashboard/DashboardComponent.vue';

import { ServiceModel, ServiceType } from './models';

//import { ServiceModel, ServiceType } from './repo/models';

export default defineComponent({
  name: 'ServerComponent',
  components: {
    ServicesListComponent,
    ServiceDetailsComponent,
    ServiceWindowComponent,
    DashboardComponent,
  },
  methods: {
    openService(service: ServiceType) {
      this.doubleClickedService = service;
      this.isDialogOpen = true;
      (this.$refs.serviceWindow as HTMLDialogElement).showModal();
    },
  },

  setup() {
    const doubleClickedService = ref<ServiceType>(new ServiceType());
    const selectedService = ref<ServiceType>(new ServiceType());
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
        selectedService.value = new ServiceType(service as ServiceModel);
        if (isDialogOpen.value) {
          doubleClickedService.value = new ServiceType(service as ServiceModel);
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
