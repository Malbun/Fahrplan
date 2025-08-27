import { defineStore } from "pinia";

export const useTripStation2Store = defineStore("tripStation2", {
  state: () => {
    return { tripStation2: "" };
  },
  actions: {
    set(val = "") {
      this.tripStation2 = val;
    },
  },
  getters: {
    get: (state) => state.tripStation2,
  },
});
