import { defineStore } from 'pinia';
import { WinRMPayload } from 'src/components/models';

export const useHostsStore = defineStore('hosts', {
  state: (): WinRMPayload[] => {
    return [];
  },
  persist: {
    storage: sessionStorage,
  },
});
