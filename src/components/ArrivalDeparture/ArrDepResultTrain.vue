<script setup>
  import { onMounted, onUpdated, ref } from "vue";
  import { getTimeAsString } from "@/utils/DateUtils.js";
  import { quayToString } from "@/utils/ArrivalDeparture.js";
  import ArrDepTrainRunner from "@/components/ArrivalDeparture/ArrDepTrainRunner.vue";

  const props = defineProps({
    stopEvent: { type: Object, required: true },
  });

  // define the reactive variables for display the train details
  const hasPrevious = ref(true);
  const hasOnward = ref(true);
  const mobileTimeAlign = ref("");
  const origin = ref("St. Gallen");
  const destination = ref("Sargans");
  const currentStation = ref("");
  const timetabledArrival = ref("08:14:00");
  const estimatedArrival = ref("08:14:48");
  const timetabledDeparture = ref("08:15:00");
  const estimatedDeparture = ref("08:16:36");
  const quay = ref("");
  const quayRed = ref(false);
  const serviceName = ref("IR13");
  const displayMode = ref(true);

  // call render function on mounted and on updated event
  onMounted(render);
  onUpdated(render);

  // displays the data
  function render() {
    // set the reactive variables for the "direct to use variables"
    hasPrevious.value = props.stopEvent.hasPrevious;
    hasOnward.value = props.stopEvent.hasOnward;
    origin.value = props.stopEvent.origin;
    destination.value = props.stopEvent.destination;
    currentStation.value = props.stopEvent.thisCall.stationName;
    serviceName.value = props.stopEvent.serviceName;
    quay.value = quayToString(props.stopEvent.thisCall.estimatedQuay);

    // check if the estimated quay is different from the planned quay
    if (
      props.stopEvent.thisCall.plannedQuay !==
      props.stopEvent.thisCall.estimatedQuay
    ) {
      // check if the plannedQuay includes a /
      if (!String(props.stopEvent.thisCall.plannedQuay).includes("/")) {
        quayRed.value = true; // set the color from the quay text to red
      }
    }

    // check if the stopEvent has a previous and onward property
    if (hasPrevious.value && hasOnward.value) {
      mobileTimeAlign.value = "center"; // set the align type to center

      // get every time as string and insert it into the reactive variable
      timetabledArrival.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.timetabledArrival),
        true,
      );
      estimatedArrival.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.estimatedArrival),
        true,
      );
      timetabledDeparture.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.timetabledDeparture),
        true,
      );
      estimatedDeparture.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.estimatedDeparture),
        true,
      );
    }

    // check if the stopEvent has not a previous but an onward property
    if (!hasPrevious.value && hasOnward.value) {
      mobileTimeAlign.value = "start"; // set the align type to start

      // get the departure times as string and insert it into the reactive variables
      timetabledDeparture.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.timetabledDeparture),
        true,
      );
      estimatedDeparture.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.estimatedDeparture),
        true,
      );
    }

    // check if the stopEvent has a previous but not an onward property
    if (hasPrevious.value && !hasOnward.value) {
      mobileTimeAlign.value = "end"; // set the alig type to end

      // get the arrival times as string and insert it into the reactive variables
      timetabledArrival.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.timetabledArrival),
        true,
      );
      estimatedArrival.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.estimatedArrival),
        true,
      );
    }
  }

  function toggleView() {
    displayMode.value = !displayMode.value;
  }
</script>

<template>
  <div @click="toggleView">
    <div v-if="displayMode">
      <div
        class="justify-content-center text-white bg-gray-900 flex flex-row justify-center p-3 m-3 rounded-xl"
      >
        <div
          class="flex flex-row items-center justify-center space-x-2"
          style="width: 90%"
        >
          <div>
            <div style="width: 20px; direction: rtl; white-space: nowrap">
              {{ serviceName }}
            </div>
          </div>
          <div class="flex flex-row justify-center space-x-1.5 dynamicAlign">
            <div class="flex flex-col items-center space-y-1">
              <div v-if="hasPrevious">{{ origin }}</div>
              <div v-if="hasPrevious">
                <svg width="20px" height="38px" style="transform: scale(1, -1)">
                  <line
                    x1="50%"
                    y1="5"
                    x2="50%"
                    y2="100%"
                    style="stroke: white; stroke-width: 5px"
                  />
                  <line
                    x1="0"
                    y1="18"
                    x2="11"
                    y2="5"
                    style="stroke: white; stroke-width: 5px"
                  />
                  <line
                    x1="20"
                    y1="18"
                    x2="9"
                    y2="5"
                    style="stroke: white; stroke-width: 5px"
                  />
                </svg>
              </div>
              <div class="bg-gray-700 p-1 rounded-lg">{{ currentStation }}</div>
              <div v-if="hasOnward">
                <svg width="20px" height="38px" style="transform: scale(1, -1)">
                  <line
                    x1="50%"
                    y1="5"
                    x2="50%"
                    y2="100%"
                    style="stroke: white; stroke-width: 5px"
                  />
                  <line
                    x1="0"
                    y1="18"
                    x2="11"
                    y2="5"
                    style="stroke: white; stroke-width: 5px"
                  />
                  <line
                    x1="20"
                    y1="18"
                    x2="9"
                    y2="5"
                    style="stroke: white; stroke-width: 5px"
                  />
                </svg>
              </div>
              <div v-if="hasOnward">{{ destination }}</div>
            </div>
            <div class="flex flex-col space-y-0.5 ml-1">
              <div v-if="hasPrevious">
                <div>{{ timetabledArrival }}</div>
                <div class="font-bold">{{ estimatedArrival }}</div>
              </div>
              <div
                :class="{ active: quayRed }"
                class="quayDisplay"
                style="width: 50px; white-space: nowrap"
              >
                {{ quay }}
              </div>
              <div v-if="hasOnward">
                <div class="">{{ timetabledDeparture }}</div>
                <div class="font-bold">{{ estimatedDeparture }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!displayMode" class="text-white bg-gray-900 p-3 m-3 rounded-xl">
      <ArrDepTrainRunner :stop-event="props.stopEvent" />
    </div>
  </div>
</template>

<style scoped>
  .dynamicAlign {
    align-items: v-bind("mobileTimeAlign");
  }

  .quayDisplay {
    color: white;
  }

  .quayDisplay.active {
    color: red;
  }
</style>
