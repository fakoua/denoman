<template>
  <div class="toolbar">
    <q-toolbar class="bg-primary text-white">
      <q-btn
        flat
        round
        dense
        icon="play_arrow"
        @click="() => executeCommand(false)"
        :disable="executing"
      />
      <q-btn
        flat
        round
        dense
        icon="playlist_play"
        @click="() => executeCommand(true)"
        :disable="executing"
      />
      <q-btn
        flat
        round
        dense
        icon="delete_outline"
        @click="clearTerminal"
        :disable="executing"
      />
    </q-toolbar>
  </div>
  <div>
    <q-splitter
      v-model="splitterModel"
      horizontal
      style="height: calc(100vh - 200px)"
      separator-class="bg-primary"
      separator-style="height: 3px"
    >
      <template v-slot:before>
        <q-resize-observer @resize="splitterChanged" :debounce="0" />
        <q-input
          ref="commandInput"
          outlined
          square
          autofocus
          v-model="command"
          type="textarea"
          :disable="executing"
          :loading="executing"
          :error="errorIndicator"
          class="terminal-input"
          resize="none"
          hide-bottom-space
        >
          <q-inner-loading :showing="executing">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </q-input>
      </template>
      <template v-slot:after>
        <div class="term" ref="terminalOutputDiv" v-html="terminal"></div>
      </template>
    </q-splitter>
  </div>
</template>

<style lang="css">
span.cmd {
  color: #fffb00;
}
textarea {
  resize: none !important;
}
</style>

<style lang="css" scoped>
.q-textarea {
  padding: 0;
  margin: 0;
}

.q-field__control {
  padding: 0 !important;
  margin: 0 !important;
}

div.q-field__bottom {
  display: none !important;
}
.terminal-input {
  font-family: 'Cascadia Mono', 'Courier New', monospace;
  font-size: 12pt;
  height: auto;
  padding: 0;
}
.term {
  background-color: #012456;
  color: #fff;
  height: auto;
  overflow: auto;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref, watch } from 'vue';

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
    async executeCommand(selected: boolean) {
      let userSelection: string | null = '';

      if (selected) {
        if (window.getSelection) {
          userSelection = window.getSelection()?.toString() ?? null;
        } else {
          userSelection = document.getSelection()?.toString() ?? null;
        }
      }

      const cmd = selected && userSelection ? userSelection : this.command;

      if (cmd === 'cls') {
        this.clearTerminal();
        return;
      }

      this.executing = true;
      this.response = await serviceApi.execCommand(this.host, cmd, true);

      this.errorIndicator = this.response.exitCode !== 0;
      window.setTimeout(() => {
        this.errorIndicator = false;
      }, 5000);
      this.executing = false;
      this.setInputFocus();
    },
  },

  setup() {
    const command = ref('');
    const response = ref<ShellResponse>({} as ShellResponse);
    const executing = ref(false);
    const errorIndicator = ref(false);
    const commandInput = ref(null);
    const terminalOutputDiv = ref(null);
    const terminal = ref('PS DenoMan>');

    watch(response, () => {
      let result = '';
      if (response.value.exitCode === 0) {
        result = response.value.stdout;
      } else {
        result = response.value.stderr;
      }

      terminal.value = `${terminal.value}<span class='cmd'>${command.value}</span>\n${result}\nPS DenoMan>`;

      window.setTimeout(() => {
        const divOutput = terminalOutputDiv.value! as HTMLDivElement;
        divOutput.scrollTop = divOutput.scrollHeight;
      }, 100);
    });

    const setInputFocus = () => {
      window.setTimeout(() => {
        (commandInput.value! as QInput).focus();
      }, 100);
    };

    const splitterChanged = () => {
      const divOutput = terminalOutputDiv.value! as HTMLDivElement;
      const parentOutput = divOutput.parentElement! as HTMLDivElement;
      divOutput.style.height = `${parentOutput.clientHeight}px`;

      const input = commandInput.value! as QInput;
      const parentInput = input.$el.parentElement! as HTMLElement;

      input.$el.querySelector('textarea')!.style.height =
        `${parentInput.clientHeight - 4}px`;
      `${parentInput.clientHeight}px`;
    };

    const clearTerminal = () => {
      terminal.value = 'PS DenoMan>';
    };

    onMounted(() => {
      // Focus on the command input. autofocus doesn't work in Quasar
      setInputFocus();
      splitterChanged();
    });

    return {
      command,
      commandInput,
      response,
      executing,
      errorIndicator,
      splitterModel: ref(35),
      terminalOutputDiv,
      terminal,
      clearTerminal,
      splitterChanged,
      setInputFocus,
    };
  },
});
</script>
