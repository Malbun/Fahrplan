<script setup>
  import Station from "@/components/Station.vue";
  import { useStationStore } from "@/stores/StationStore.js";
  import { useResultCountStore } from "@/stores/ResultCountStore.js";
  import { onMounted } from "vue";
  import { useDateStore } from "@/stores/DateStore.js";
  import { processArrivalDeparture } from "@/utils/ArrivalDeparture.js";

  const stationStore = useStationStore();
  const resultCountStore = useResultCountStore();
  const dateStore = useDateStore();

  onMounted(init); // call init function when the component gets loaded

  // inits the component
  function init() {
    resultCountStore.resultCount = 15; // sets the default result count to 15
  }

  // gets all information. Triggered by button click
  async function run() {
    const result = await processArrivalDeparture(
      stationStore.station,
      dateStore.date,
      resultCountStore.resultCount,
    );
  }
</script>

<template>
  <div class="m-3">
    <div
      class="flex flex-wrap items-center flex-row justify-between bg-blue-300 rounded-2xl p-3"
    >
      <Station
        id="arrdep"
        :store="stationStore"
        title="Bahnhof/Haltestelle:"
        class="m-0.5"
      />
      <div class="m-0.5">
        <label for="resultCountArrDep">Ergebnisse:</label>
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
      <button
        class="bg-blue-300 text-black p-1.5 rounded-xl cursor-pointer hover:bg-gray-900 hover:text-white duration-300 hover:rounded-lg"
        @click="run()"
      >
        Suchen
      </button>
    </div>
    <div id="arrdepResultContainer"></div>
  </div>
</template>

<style scoped></style>
