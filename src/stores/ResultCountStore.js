import { defineStore } from "pinia";

export const useResultCountStore = defineStore("resultCount", {
  state: () => {
    return { resultCount: 0 };
  },
  actions: {
    set(val = 0) {
      this.resultCount = val;
    },
  },
  getters: {
    get: (state) => state.resultCount,
  },
});
