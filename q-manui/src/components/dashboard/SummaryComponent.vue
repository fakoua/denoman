<template>
  <q-card flat bordered style="min-height: 268px" v-if="loading">
    <q-item>
      <q-item-section avatar>
        <q-skeleton type="QAvatar" />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <q-skeleton type="text" />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton type="text" />
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-skeleton height="200px" square />
  </q-card>
  <q-card flat bordered v-if="!loading">
    <q-card-section>
      <div class="text-h6">Summary</div>
      <div class="text-weight-thin">
        {{ (services?.total ?? 0) + (drivers?.total ?? 0) }} total services
        &amp; drivers
      </div>
    </q-card-section>

    <q-markup-table dense>
      <tbody>
        <tr>
          <td class="text-left"></td>
          <td class="text-right text-weight-bold">Services</td>
          <td class="text-right text-weight-bold">Drivers</td>
        </tr>
        <tr>
          <td class="text-left text-light-green">Running</td>
          <td class="text-right text-light-green">
            {{ services?.running }}
          </td>
          <td class="text-right text-light-green">
            {{ drivers?.running }}
          </td>
        </tr>
        <tr>
          <td class="text-left text-red-9">Stopped</td>
          <td class="text-right text-red-9">
            {{ services?.stopped }}
          </td>
          <td class="text-right text-red-9">{{ drivers?.stopped }}</td>
        </tr>
        <tr>
          <td class="text-left text-indigo-6">Automatic</td>
          <td class="text-right text-indigo-6">
            {{ services?.automatic }}
          </td>
          <td class="text-right text-indigo-6">
            {{ drivers?.automatic }}
          </td>
        </tr>
        <tr>
          <td class="text-left text-grey-5">Manual</td>
          <td class="text-right text-grey-5">
            {{ services?.manual }}
          </td>
          <td class="text-right text-grey-5">{{ drivers?.manual }}</td>
        </tr>
        <tr>
          <td class="text-left text-weight-bold">Total</td>
          <td class="text-right">{{ services?.total }}</td>
          <td class="text-right">{{ drivers?.total }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { ServiceStatusModel } from '../models';

export default defineComponent({
  name: 'SummaryComponent',
  props: {
    services: Object as PropType<ServiceStatusModel>,
    drivers: Object as PropType<ServiceStatusModel>,
    loading: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    return {};
  },
});
</script>
