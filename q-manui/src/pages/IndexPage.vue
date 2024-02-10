<template>
  <q-page class="row">
    <div class="q-gutter-y-md" v-if="hostStore.hosts.length > 0">
      <q-card flat>
        <q-tabs
          v-model="selectedTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab
            v-for="host in hostStore.hosts"
            v-bind:key="host.hostname"
            :label="
              host.hostname + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
            "
            :name="host.hostname"
          >
            <q-btn
              style="position: absolute; right: 0"
              flat
              size="10px"
              padding="xs"
              @click="
                () => {
                  promptClose(host.hostname);
                }
              "
            >
              <q-icon name="close" />
            </q-btn>
          </q-tab>
          <q-btn flat size="10px" padding="xs" @click="showAddDialog = true">
            <q-icon name="add" />
          </q-btn>
        </q-tabs>

        <q-tab-panels
          v-model="selectedTab"
          keep-alive
          animated
          class="no-margin no-padding"
        >
          <q-tab-panel
            v-for="host in hostStore.hosts"
            v-bind:key="host.hostname"
            :name="host.hostname"
            class="no-margin no-padding"
          >
            <ServerComponent :host="host" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
    <q-dialog
      v-model="showAddDialog"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="bg-indigo text-white q-pa-none" style="width: 432px">
        <q-form autocomplete="off" @submit="addServer">
          <q-card-section>
            <div class="text-h6">Add server</div>
          </q-card-section>

          <q-card-section class="bg-white text-black q-pt-none q-ma-none">
            <q-card style="width: 400px" flat>
              <q-card-section>
                <q-input
                  v-model="hostname"
                  label="Hostname"
                  dense
                  autocomplete="nofill"
                  lazy-rules
                  autofocus
                  :rules="[(val) => !!val || 'Field is required']"
                />
                <q-input
                  v-model="username"
                  label="Username"
                  dense
                  autocomplete="nofill"
                  lazy-rules
                  :rules="[(val) => !!val || 'Field is required']"
                />
                <q-input
                  v-model="password"
                  type="password"
                  label="Password"
                  dense
                  autocomplete="nofill"
                  lazy-rules
                  :rules="[(val) => !!val || 'Field is required']"
                />
                <div>
                  <div>Server:</div>
                  <div
                    class="server-pattern fit row wrap justify-start items-start content-start"
                  >
                    <q-input
                      v-model="protocol"
                      dense
                      maxlength="5"
                      autocomplete="nofill"
                      lazy-rules
                      :rules="[(val) => !!val || '*']"
                      style="width: 40px"
                    />
                    <div class="server-static">://</div>
                    <div class="server-static">{{ hostname }}:</div>
                    <div>
                      <q-input
                        v-model="port"
                        dense
                        type="number"
                        autocomplete="nofill"
                        lazy-rules
                        :rules="[(val) => !!val || '*']"
                        style="width: 50px"
                      />
                    </div>
                    <div class="server-static">/wsman</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="bg-white text-indigo">
            <q-btn type="submit" flat label="OK" />
            <q-btn flat label="Cancel" v-close-popup />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmClose" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="question_mark" color="primary" text-color="white" />
          <span class="q-ml-sm">
            Are you sure you want to close this server?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Yes"
            color="red"
            v-close-popup
            @click="
              () => {
                closeTab(confirmedTab);
              }
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style lang="css" scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

.server-pattern .server-static {
  line-height: 40px;
  font-weight: 600;
}

.left {
  border-right: 1px solid rgb(230, 229, 229);
}
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ServerComponent from '../components/ServerComponent.vue';
import { WinRMPayload } from 'src/components/models';
import { useHostsStore } from 'src/stores/hosts-store';

export default defineComponent({
  name: 'IndexPage',
  components: { ServerComponent },

  setup() {
    const selectedTab = ref('');
    const showAddDialog = ref(false);
    const hostname = ref('');
    const username = ref('');
    const password = ref('');
    const protocol = ref('http');
    const port = ref(5985);
    const confirmClose = ref(false);
    const confirmedTab = ref<string>('');

    const hostStore = useHostsStore();
    if (hostStore.hosts.length == 0) {
      showAddDialog.value = true;
    } else {
      selectedTab.value = hostStore.hosts[0].hostname;
    }

    const addServer = () => {
      const payload: WinRMPayload = {
        hostname: hostname.value,
        username: username.value,
        password: password.value,
        protocol: protocol.value,
        port: port.value,
      };
      hostStore.hosts = [...hostStore.hosts, payload];
      showAddDialog.value = false;
      selectedTab.value = payload.hostname;
      hostname.value = '';
      username.value = '';
      password.value = '';
      protocol.value = 'http';
      port.value = 5985;
    };

    const closeTab = (hostname: string) => {
      hostStore.hosts = hostStore.hosts.filter(
        (host) => host.hostname != hostname
      );
      if (hostStore.hosts.length == 0) {
        showAddDialog.value = true;
      } else {
        selectedTab.value = hostStore.hosts[0].hostname;
        setTimeout(() => {
          selectedTab.value = hostStore.hosts[0].hostname;
        }, 100);
      }
    };

    const promptClose = (tab: string) => {
      confirmedTab.value = tab;
      confirmClose.value = true;
    };

    return {
      selectedTab,
      hostname,
      username,
      password,
      protocol,
      port,
      showAddDialog,
      hostStore,
      confirmClose,
      confirmedTab,
      addServer,
      closeTab,
      promptClose,
    };
  },
});
</script>
