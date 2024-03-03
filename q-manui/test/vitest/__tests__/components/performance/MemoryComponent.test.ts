import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it } from 'vitest';

import MemoryComponent from '../../../../../src/components/performance/MemoryComponent.vue';
import { PerfmonModel, SystemModel } from 'src/components/models';
import { nextTick } from 'vue';

installQuasarPlugin({ plugins: { Notify } });

const perfmonData: PerfmonModel = {
  cpu: 14,
  disks: [
    {
      diskReadBytesPersec: 0,
      diskWriteBytesPersec: 0,
      name: 'C:',
      percentDiskTime: 10,
    },
  ],
  memory: {
    freeMemory: 890504,
    totalMemory: 4096,
  },
  networks: {
    bytesReceivedPersec: 0,
    bytesSentPersec: 0,
    bytesTotalPersec: 0,
    name: 'Ethernet',
  },
};

const systemData: SystemModel = {
  caption: 'Microsoft Windows 11',
  csName: 'DESKTOP-123',
  osArchitecture: '64-bit',
  processorName: 'Intel(R) Core(TM) i7-7700HQ CPU @ 2.80GHz',
  memory: '8 GB',
};

describe('memory component', () => {
  it('should load [loading]', async () => {
    const wrapper = mount(MemoryComponent, {
      props: {
        system: systemData,
        perfmon: perfmonData,
      },
    });

    await nextTick();

    expect(wrapper.html()).toContain('Total Memory');
  });
});
