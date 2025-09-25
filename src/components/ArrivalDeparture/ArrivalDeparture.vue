<script setup>
  import Station from "@/components/Station.vue";
  import { useStationStore } from "@/stores/StationStore.js";
  import { useResultCountStore } from "@/stores/ResultCountStore.js";
  import { h, onMounted, ref, render } from "vue";
  import { useDateStore } from "@/stores/DateStore.js";
  import { processArrivalDeparture } from "@/utils/ArrivalDeparture.js";
  import ArrDepResultTrain from "@/components/ArrivalDeparture/ArrDepResultTrain.vue";
  import WaitingAnimation from "@/components/WaitingAnimation.vue";

  const stationStore = useStationStore();
  const resultCountStore = useResultCountStore();
  const dateStore = useDateStore();

  const resultPresent = ref(true); // Stores the resultPresent state. True: Shows result. False: Shows waiting animation

  onMounted(init); // call init function when the component gets loaded

  // inits the component
  function init() {
    resultCountStore.resultCount = 15; // sets the default result count to 15
  }

  // gets all information. Triggered by button click
  async function run() {
    const resultContainer = document.getElementById("arrdepResultContainer"); // get the container for the results from the DOM

    const overrideNode = h("div", null, null); // create an empty override node
    render(overrideNode, resultContainer); // render the override node to remove old data

    resultPresent.value = false; // set the resultPresent to false

    // get the results from the API
    const allResults = await processArrivalDeparture(
      stationStore.station,
      dateStore.date,
      resultCountStore.resultCount,
    );

    const arrDepTrainArray = []; // init array for each ArrDepResult

    // iterate over the results
    for (const result of allResults) {
      // create a virtual Node of ArrDepResultTrain from the current train
      const currentArrivalDeparture = h(
        ArrDepResultTrain,
        {
          stopEvent: result,
        },
        null,
      );
      arrDepTrainArray.push(currentArrivalDeparture); // add the created virtual Node to the array for the ArrDepResults
    }

    const resultDivVNode = h("div", arrDepTrainArray); // create a virtual Node containing all ArrDepResults
    render(resultDivVNode, resultContainer); // render the combined virtual Node

    resultPresent.value = true; // set the resultPresent to true
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
    <WaitingAnimation v-show="!resultPresent" />
    <div v-show="resultPresent" id="arrdepResultContainer"></div>
  </div>
</template>

<style scoped></style>
