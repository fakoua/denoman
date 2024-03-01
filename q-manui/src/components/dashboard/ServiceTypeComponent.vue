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
    <q-card-section class="text-blue-6">
      <div class="text-h6">
        Service Types
        <q-icon name="help">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-banner class="bg-blue text-white">
              <q-markup-table
                dense
                flat
                class="tb-popup bg-blue text-white"
                wrap-cells
                style="width: 500px"
              >
                <tbody>
                  <tr>
                    <td class="text-weight-bolder" style="width: 100px">
                      Type
                    </td>
                    <td class="text-weight-bolder" style="width: 200px">
                      Description
                    </td>
                  </tr>
                  <tr>
                    <td>Adapter</td>
                    <td>
                      A service for a hardware device that requires its own
                      driver.
                    </td>
                  </tr>
                  <tr>
                    <td>Recognizer Driver</td>
                    <td>
                      A file system driver used during startup to determine the
                      file systems present on the system.
                    </td>
                  </tr>
                  <tr>
                    <td>Kernel Driver</td>
                    <td>
                      A Kernel device driver such as a hard disk or other
                      low-level hardware device driver.
                    </td>
                  </tr>
                  <tr>
                    <td>File System Driver</td>
                    <td>
                      A file system driver, which is also a Kernel device
                      driver.
                    </td>
                  </tr>
                  <tr>
                    <td>Own Process</td>
                    <td>
                      A Win32 program that can be started by the Service
                      Controller and that obeys the service control protocol.
                      This type of Win32 service runs in a process by itself.
                    </td>
                  </tr>
                  <tr>
                    <td>Share Process</td>
                    <td>
                      A Win32 service that can share a process with other Win32
                      services.
                    </td>
                  </tr>
                  <tr>
                    <td>Interactive Process</td>
                    <td>A service that can communicate with the desktop.</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-banner>
          </q-popup-proxy>
        </q-icon>
      </div>
      <div class="text-weight-thin" style="font-size: 10px">
        The service type indicates how the service is used by the system.
      </div>
    </q-card-section>
    <div class="critical-table">
      <q-markup-table dense flat>
        <tbody>
          <tr>
            <td class="text-weight-bold">Service Type</td>
            <td class="text-weight-bold text-right">Count</td>
          </tr>
          <tr v-for="item in types" :key="item[0]">
            <td>
              {{ item[0] }}
            </td>
            <td class="text-right">
              {{ item[1] }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </q-card>
</template>

<style lang="css" scoped>
.critical-table {
  overflow-y: auto;
  max-height: 172px;
}
.tb-popup td {
  word-wrap: break-word;
  font-size: 11px;
  font-weight: 100;
  text-rendering: optimizeLegibility;
}
</style>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ServiceTypeComponent',
  props: {
    types: Object as PropType<[type: string, count: number][]>,
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
