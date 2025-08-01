import { defineStore } from 'pinia'

export const useApikeyStore = defineStore('apikey', {
  state: () => {
    return {apikey: ''}
  },
  actions: {
    set(val = '') {
      this.apikey = val;
    }
  },
  getters: {
    get: (state) => state.apikey,
  },
});
