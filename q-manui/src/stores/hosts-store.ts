import { defineStore } from 'pinia';
import { WinRMPayload } from 'src/components/models';

export const useHostsStore = defineStore('hosts', {
  state: () => {
    return {
      hosts: [] as WinRMPayload[],
    };
  },
  persist: {
    storage: localStorage,
  },
});
