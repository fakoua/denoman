<template>
  <q-layout v-if="!shutdown" view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar>
          <img src="/icons/denoman.svg" alt="DenoMan" />
        </q-avatar>
        <q-toolbar-title> DenoMan </q-toolbar-title>

        <div>
          v {{ version }}
          <q-btn
            flat
            round
            dense
            icon="power_settings_new"
            @click="confirm = true"
          />
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
  <q-dialog v-model="confirm" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar
          icon="power_settings_new"
          color="deep-orange"
          text-color="white"
        />
        <span class="q-ml-sm">Are you sure you want to exit DenoMan?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Exit DenoMan" color="deep-orange" @click="exitApp" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import * as serviceApi from '../components/service-api';

import { version } from '../../package.json';

export default defineComponent({
  name: 'MainLayout',

  methods: {
    async exitApp() {
      this.confirm = false;
      serviceApi.exitApp();
      this.shutdown = true;
    },
  },
  setup() {
    const confirm = ref(false);
    const shutdown = ref(false);
    return {
      shutdown,
      version,
      confirm,
    };
  },
});
</script>
