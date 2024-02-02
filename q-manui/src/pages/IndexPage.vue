<template>
  <q-page class="row">
    <div class="q-gutter-y-md" v-if="isLoggedIn">
      <q-card v-if="isLoggedIn" flat>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="tab1" :label="hostname" />
        </q-tabs>

        <q-tab-panels
          v-model="tab"
          keep-alive
          animated
          class="no-margin no-padding"
        >
          <q-tab-panel name="tab1" class="no-margin no-padding">
            <ServerComponent />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
    <div
      v-if="!isLoggedIn"
      class="fit row wrap justify-center items-center content-center q-pa-xl"
    >
      <q-form autocomplete="off" @submit="onSubmit">
        <q-card v-if="!isLoggedIn" style="width: 400px">
          <q-card-section>
            <q-input
              v-model="hostname"
              label="Hostname"
              dense
              autocomplete="nofill"
              lazy-rules
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
          <q-separator />
          <q-card-actions align="right">
            <q-btn flat type="submit">Connect</q-btn>
          </q-card-actions>
        </q-card>
      </q-form>
    </div>
  </q-page>
</template>

<style lang="css" scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
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
    const isLoggedIn = ref(false);
    const hostname = ref('');
    const username = ref('');
    const password = ref('');
    const protocol = ref('http');
    const port = ref(5985);

    const hosts = useHostsStore();
    if (hosts.$state.length > 0) {
      hostname.value = hosts.$state[0].host;
    }
    isLoggedIn.value = hosts.$state.length > 0;

    const onSubmit = () => {
      const payload: WinRMPayload = {
        host: hostname.value,
        username: username.value,
        password: password.value,
        protocol: protocol.value,
        port: port.value,
      };
      hosts.$state = [payload];
      isLoggedIn.value = true;
    };
    return {
      tab: ref('tab1'),
      isLoggedIn,
      hostname,
      username,
      password,
      protocol,
      port,
      onSubmit,
    };
  },
});
</script>
