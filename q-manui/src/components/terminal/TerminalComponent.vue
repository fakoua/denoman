<template>
  <div class="fit row wrap justify-start items-start content-start">
    <div class="col-grow">
      <div>Terminal</div>
      <div>
        <q-input
          ref="commandInput"
          outlined
          v-model="command"
          type="textarea"
          :disable="executing"
          :loading="executing"
          :error="errorIndicator"
        >
          <q-inner-loading :showing="executing">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </q-input>
      </div>
      <div style="margin-top: 4px">
        <q-btn
          label="Execute as PowerShell"
          color="black"
          unelevated
          :disable="executing"
          @click="
            () => {
              executeCommand(true);
            }
          "
          style="margin-right: 4px"
        />
        <q-btn
          color="primary"
          label="Execute as Command Line"
          unelevated
          :disable="executing"
          @click="
            () => {
              executeCommand(false);
            }
          "
        />
      </div>
      <div>
        <div class="term">
          {{ terminalResult }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.term {
  background-color: #000;
  color: #fff;
  height: 460px;
  overflow: auto;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>

<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue';
import * as serviceApi from '../service-api';
import { ShellResponse, WinRMPayload } from '../models';
import { QInput } from 'quasar';

export default defineComponent({
  name: 'TerminalComponent',

  props: {
    host: {
      type: Object as PropType<WinRMPayload>,
      required: true,
    },
  },

  methods: {
    async executeCommand(isPowerShell: boolean) {
      this.executing = true;
      this.response = await serviceApi.execCommand(
        this.host,
        this.command,
        isPowerShell,
      );

      this.errorIndicator = this.response.exitCode !== 0;
      window.setTimeout(() => {
        this.errorIndicator = false;
      }, 5000);
      if (this.response.exitCode === 0) {
        this.command = '';
      }
      this.executing = false;
      window.setTimeout(() => {
        (this.commandInput! as QInput).focus();
      }, 100);
    },
  },

  setup() {
    const command = ref('');
    const response = ref<ShellResponse>({} as ShellResponse);
    const executing = ref(false);
    const errorIndicator = ref(false);
    const commandInput = ref(null);
    const terminalResult = computed(() => {
      if (response.value.exitCode === 0) {
        return response.value.stdout;
      } else {
        return response.value.stderr;
      }
    });
    return {
      command,
      commandInput,
      response,
      executing,
      errorIndicator,
      terminalResult,
    };
  },
});
</script>
