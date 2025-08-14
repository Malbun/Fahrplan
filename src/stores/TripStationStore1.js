import { defineStore } from 'pinia';

export const useTripStation1Store = defineStore('tripStation1', {
  state: () => {
    return {tripStation1: ''}
  },
  actions: {
    set(val = '') {
      this.tripStation1 = val;
    }
  },
  getters: {
    get: (state) => state.tripStation1,
  },
})