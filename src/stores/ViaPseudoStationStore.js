import { defineStore } from "pinia";

export const useViaPseudoStation = defineStore("viaPseudoStation", {
  state: () => {
    return { viaPseudoStation: "" };
  },
  actions: {
    set(val = "") {
      this.viaPseudoStation = val;
    },
  },
  getters: {
    get: (state) => state.viaPseudoStation,
  },
});
