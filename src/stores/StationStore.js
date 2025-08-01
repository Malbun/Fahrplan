import { defineStore } from 'pinia';

export const useStationStore = defineStore('station', {
  state: () => {
    return {station: ''}
  },
  actions: {
    set(val = '') {
      this.station = val;
    }
  },
  getters: {
    get: (state) => state.station,
  },
})