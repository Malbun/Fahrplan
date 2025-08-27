<script setup>
import { useStationStore } from "@/stores/StationStore.js";
import { useResultCountStore } from "@/stores/ResultCountStore.js";
import Station from "@/components/Station.vue";

const stationStore = useStationStore();
const resultCountStore = useResultCountStore();
resultCountStore.set(15);
</script>

<template>
  <div class="m-3">
    <div
      class="flex flex-wrap items-center flex-row justify-between bg-blue-300 rounded-2xl p-3"
    >
      <div class="space-x-3 flex flex-wrap m-0.5">
        <RouterLink
          to="/arr"
          class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300"
          active-class="bg-white"
        >
          Ankunftsanzeiger
        </RouterLink>
        <RouterLink
          to="/dep"
          class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300"
          active-class="bg-white"
        >
          Abfahrtsanzeiger
        </RouterLink>
      </div>
      <Station
        id="arrdep"
        :store="stationStore"
        title="Bahnhof/Haltestelle:"
        class="m-0.5"
      />
      <div class="m-0.5">
        <label for="resultCountArrDep">Ergebnisse: </label>
        <input
          id="resultCountArrDep"
          v-model="resultCountStore.resultCount"
          type="number"
          placeholder="Anzahl"
          class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
        />
      </div>
    </div>
    <div class="text-gray-100 mt-2">
      <RouterView id="router-view"> </RouterView>
    </div>
  </div>
</template>
