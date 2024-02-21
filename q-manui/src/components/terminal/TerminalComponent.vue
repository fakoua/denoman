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
        <textarea id="code" name="code" ref="commandInput"></textarea>
      </template>
      <template v-slot:after>
        <div class="term" ref="terminalOutputDiv" v-html="terminal"></div>
      </template>
    </q-splitter>
  </div>
  <div ref="spinner" class="spinner">
    <q-spinner-cube size="xl" color="white" v-if="executing" />
  </div>
</template>

<style lang="css" scoped>
.spinner {
  position: absolute;
}
:deep(.q-splitter__panel.q-splitter__before) {
  overflow: hidden;
}

:deep(span.cmd) {
  color: #fffb00;
}
:deep(textarea) {
  resize: none !important;
}
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

type Size = {
  /**
   * Layout height
   */
  height: number;
  /**
   * Layout width
   */
  width: number;
};

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
      // @ts-expect-error - Code mirror is not typed
      this.command = selected ? this.cm.getSelection() : this.cm.getValue();

      if (this.command === '') {
        return;
      }

      if (this.command === 'cls') {
        this.clearTerminal();
        return;
      }

      this.executing = true;
      this.response = await serviceApi.execCommand(
        this.host,
        this.command,
        true,
      );

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
    const splitterModel = ref(35);
    const initialSize = ref<Size>({ height: 0, width: 0 });
    const spinner = ref(null);
    const cm = ref<unknown>(null);

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
        //@ts-expect-error - Code mirror is not typed
        cm.value.focus();
      }, 100);
    };

    const splitterChanged = (size: Size) => {
      if (initialSize.value.height === 0) {
        initialSize.value = size;
      }
      const divOutput = terminalOutputDiv.value! as HTMLDivElement;
      const parentOutput = divOutput.parentElement! as HTMLDivElement;
      divOutput.style.height = `${parentOutput.clientHeight}px`;

      if (cm.value) {
        //@ts-expect-error - Code mirror is not typed
        cm.value.setSize(size.width, size.height);
      }

      if (spinner.value) {
        const divSpinner = spinner.value as HTMLDivElement;
        divSpinner.style.top = `${size.height + 72}px`;
        divSpinner.style.left = `${size.width - 34}px`;
      }
    };

    const clearTerminal = () => {
      terminal.value = 'PS DenoMan>';
    };

    onMounted(() => {
      // Focus on the command input. autofocus doesn't work in Quasar

      //@ts-expect-error - Code mirror is not typed
      cm.value = CodeMirror.fromTextArea(document.getElementById('code'), {
        lineNumbers: true,
        mode: 'application/x-powershell',
        theme: 'cobalt',
      });

      window.setTimeout(() => {
        splitterModel.value = 35;
        splitterChanged(initialSize.value);
        setInputFocus();
      }, 100);
    });

    return {
      command,
      commandInput,
      response,
      executing,
      errorIndicator,
      splitterModel,
      terminalOutputDiv,
      terminal,
      cm,
      initialSize,
      spinner,
      clearTerminal,
      splitterChanged,
      setInputFocus,
    };
  },
});
</script>
