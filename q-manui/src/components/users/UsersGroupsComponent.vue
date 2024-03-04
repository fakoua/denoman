<template>
  <div>
    <q-tabs v-model="tab" class="text-accent" dense align="left">
      <q-tab name="users" label="Users" />
      <q-tab name="groups" label="Groups" />
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="users">
        <users-component :host="host" />
      </q-tab-panel>
      <q-tab-panel name="groups">
        <groups-component :host="host" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';

import UsersComponent from './UsersComponent.vue';
import GroupsComponent from './GroupsComponent.vue';

import { WinRMPayload } from '../models';

export default defineComponent({
  name: 'UsersGroupsComponent',
  components: {
    UsersComponent,
    GroupsComponent,
  },
  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },

  setup() {
    return {
      tab: ref('users'),
    };
  },
});
</script>
