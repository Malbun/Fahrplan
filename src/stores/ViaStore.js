import { defineStore } from "pinia";

export const useViaStore = defineStore("via", {
  state: () => ({
    vias: [], // array state
  }),
  actions: {
    set(vias = []) {
      this.vias = vias;
    },
    add(via) {
      this.vias.push(via);
    },
    remove(index) {
      this.vias.splice(index, 1);
    },
    clear() {
      this.vias = [];
    },
  },
  getters: {
    count: (state) => state.vias.length,
  },
});
