import { defineStore } from 'pinia'

export const useDateStore = defineStore('date', {
  state: () => {
    return {date: ''}
  },
  actions: {
    set(val = '') {
      this.date = val;
    }
  },
  getters: {
    get: (state) => state.date,
  },
});
