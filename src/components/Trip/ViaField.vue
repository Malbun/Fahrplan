<script setup>
  import { h, onMounted, ref, render, watch } from "vue";
  import Station from "@/components/Station.vue";
  import { useViaPseudoStation } from "@/stores/ViaPseudoStationStore.js";
  import { useViaStore } from "@/stores/ViaStore.js";

  const viaPseudoStationStore = useViaPseudoStation(); // init pseudoViaStore
  const viaStore = useViaStore(); // init viaStore

  let viaFieldContainer; // init the variable for the viaFieldContainer. Contains all StationInputs

  let viaFieldCounter = 1; // counter variable for uniq id for station inputs

  const viaDisplayToggle = ref(false); // controls if the via fields are displayed. controlled by the via slider
  const viaFieldNodes = []; // array for all stationInputs

  // updates the via fields view every time the viaDisplayToggle variable changes
  watch(viaDisplayToggle, () => {
    updateViaStations(); // update the station input view
  });

  // runs when the component is fully loaded
  onMounted(() => {
    viaFieldContainer = document.getElementById("viaFieldContainer"); // get the viaFieldContainer from the DOM. This Container contains all station inputs

    // create initial stationInput
    viaFieldNodes.push({
      node: h(
        Station,
        {
          store: viaPseudoStationStore,
          title: "Via:",
          id: "0",
          changed: stationValueChanged,
        },
        null,
      ),
      id: 0,
    });
    updateViaStations(); // update the via station view
  });

  // updates the via station view
  function updateViaStations() {
    const vNode = h(
      "div",
      {},
      viaFieldNodes.map((c) => h("div", { class: "mt-1" }, c.node)),
    ); // takes all station input nodes and packs it into one div virtual node
    render(vNode, viaFieldContainer); // renders the virtual node in the via field container
  }

  // is call every time the value in a station input is changed
  function stationValueChanged() {
    let lastBlankInput = -1; // init the variable for the index of the last blank input
    let secondLastBlankInput = -1; // init the variable for the index of the second last blank input

    // loop backwards over all via station fields
    for (let i in viaFieldNodes) {
      const currentInput = document.getElementById(
        `StationInput-${viaFieldNodes[viaFieldNodes.length - 1 - i].id}`,
      ); // get the current station from the DOM

      // check if the input field is empty
      if (currentInput.value === "") {
        secondLastBlankInput = lastBlankInput; // write the lastBlankInput to secondLastBlankInput to get space for the new one
        lastBlankInput = viaFieldNodes[viaFieldNodes.length - 1].id; // set the lastBlankInput variable to the current field
      } else {
        break; // reached first input with content. stop looping through the rest of the inputs
      }
    }

    // checks if no input is empty
    if (lastBlankInput === -1) {
      // create a new input
      viaFieldNodes.push({
        node: h(
          Station,
          {
            store: viaPseudoStationStore,
            title: `Via:`,
            id: `${viaFieldCounter}`,
            changed: stationValueChanged,
          },
          null,
        ),
        id: viaFieldCounter,
      });
      viaFieldCounter++; // increments the via field id counter
    }
    // A blank input field is existing
    else {
      // checks if the secondLastBlankInput was changed
      if (secondLastBlankInput !== -1) {
        viaFieldNodes.pop(); // removes the last input from the viaFielNodes array
      }
    }

    updateViaStations(); // triggers the re-render for the input fields

    viaStore.clear(); // clear viaStore

    // loop over all inputs
    for (let i of viaFieldNodes) {
      const currentInput = document.getElementById(`StationInput-${i.id}`); // get current input
      // check if the input is not empty
      if (currentInput.value !== "") {
        viaStore.add(currentInput.value); // add the current value from the input to the viaStore array
      }
    }
  }
</script>

<template>
  <div>
    <div class="flex flex-row items-center space-x-1">
      <div id="toggleViaLabel">Via</div>
      <label class="switch">
        <input
          id="viaDisplayToggleInput"
          v-model="viaDisplayToggle"
          type="checkbox"
        />
        <span class="slider round"></span>
      </label>
    </div>
    <div v-show="viaDisplayToggle" id="viaFieldContainer" class="mt-2"></div>
  </div>
</template>

<style scoped>
  #toggleViaLabel {
    font-size: large;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #1e2939;
    -webkit-transition: 0.3s;
    transition: 0.3s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.3s;
    transition: 0.3s;
  }

  input:checked + .slider {
    background-color: oklch(62.3% 0.214 259.815);
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>
