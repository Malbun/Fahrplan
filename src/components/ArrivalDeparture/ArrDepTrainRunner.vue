<script setup>
  import { onMounted, ref } from "vue";
  import { quayToString } from "@/utils/ArrivalDeparture.js";
  import { getTimeAsString, isDelayed } from "@/utils/DateUtils.js";

  // define props
  const props = defineProps({
    stopEvent: { type: Object, required: true },
  });

  // define reactive variables
  const serviceName = ref("");
  const parsedCalls = ref([]); // contains all alls for display

  onMounted(render);

  // renders the information
  function render() {
    serviceName.value = props.stopEvent.serviceName; // get the service name

    // init variables for parsed and ready-to-display data
    let parsedPreviousCalls = [];
    let parsedThisCall = {};
    let parsedOnwardCalls = [];

    // checks if previous calls exists
    if (props.stopEvent.hasPrevious) {
      // map the previous calls to a usable format and process data from this calls
      parsedPreviousCalls = props.stopEvent.previousCall.map((obj) => {
        const result = {}; // init main object
        // set all properties that are the same in the processed element
        result.timetabledArrival = obj.timetabledArrival;
        result.estimatedArrival = obj.estimatedArrival;
        result.timetabledDeparture = obj.timetabledDeparture;
        result.estimatedDeparture = obj.estimatedDeparture;
        result.stationName = obj.stationName;
        result.lastPrevious = false;
        result.secondLastOnward = false;
        result.lastOnward = false;
        result.quayRed = false;
        result.currentStation = false;
        result.hasArrival = true;
        result.hasDeparture = true;
        // check if the estimated times are delayed
        result.delayedArrival = isDelayed(
          obj.timetabledArrival,
          obj.estimatedArrival,
        );
        result.delayedDeparture = isDelayed(
          obj.timetabledDeparture,
          obj.estimatedDeparture,
        );

        result.quay = ""; // init quay on the main object

        // check if the quay has changed and set the quayRed flag
        if (obj.plannedQuay !== obj.estimatedQuay) {
          // check if the plannedQuay includes a /
          if (!String(obj.plannedQuay).includes("/")) {
            result.quayRed = true;
          }
        }

        // set the quay value with the right prefix
        result.quay = quayToString(obj.estimatedQuay);

        // set the hasArrival flag if the arrival times are not undefined
        result.hasArrival = !(
          obj.timetabledArrival === undefined ||
          obj.estimatedArrival === undefined
        );

        return result; // return the main object
      });

      // set the lasPrevious flag on the last element
      const lastPreviousCall =
        parsedPreviousCalls[parsedPreviousCalls.length - 1];
      lastPreviousCall.lastPrevious = true;
      parsedPreviousCalls[parsedPreviousCalls.length - 1] = lastPreviousCall;
    }

    // process thisCall
    // set all properties that are the same in the processed element
    parsedThisCall.timetabledArrival =
      props.stopEvent.thisCall.timetabledArrival;
    parsedThisCall.estimatedArrival = props.stopEvent.thisCall.estimatedArrival;
    parsedThisCall.timetabledDeparture =
      props.stopEvent.thisCall.timetabledDeparture;
    parsedThisCall.estimatedDeparture =
      props.stopEvent.thisCall.estimatedDeparture;
    parsedThisCall.stationName = props.stopEvent.thisCall.stationName;
    parsedThisCall.lastPrevious = false;
    parsedThisCall.secondLastOnward = false;
    parsedThisCall.lastOnward = false;
    parsedThisCall.quayRed = false;
    parsedThisCall.currentStation = true;
    parsedThisCall.hasArrival = true;
    parsedThisCall.hasDeparture = true;
    // check if the estimated time is delayed
    parsedThisCall.delayedArrival = isDelayed(
      props.stopEvent.thisCall.timetabledArrival,
      props.stopEvent.thisCall.estimatedArrival,
    );
    parsedThisCall.delayedDeparture = isDelayed(
      props.stopEvent.thisCall.timetabledDeparture,
      props.stopEvent.thisCall.estimatedDeparture,
    );

    parsedThisCall.quay = ""; // init the quay value

    // check if the quay has changed to a not planned quay
    if (
      props.stopEvent.thisCall.plannedQuay !==
      props.stopEvent.thisCall.estimatedQuay
    ) {
      // check if the plannedQuay includes a /
      if (!String(props.stopEvent.thisCall.plannedQuay).includes("/")) {
        parsedThisCall.quayRed = true;
      }
    }

    // get the quay as string with the right prefix
    parsedThisCall.quay = quayToString(props.stopEvent.thisCall.estimatedQuay);

    // check if the hasOnward flag is set
    if (props.stopEvent.hasOnward) {
      // map the onward calls to a usable format and process data from this calls
      parsedOnwardCalls = props.stopEvent.onwardCall.map((obj) => {
        const result = {};
        result.timetabledArrival = obj.timetabledArrival;
        result.estimatedArrival = obj.estimatedArrival;
        result.timetabledDeparture = obj.timetabledDeparture;
        result.estimatedDeparture = obj.estimatedDeparture;
        result.stationName = obj.stationName;
        result.lastPrevious = false;
        result.secondLastOnward = false;
        result.lastOnward = false;
        result.quayRed = false;
        result.currentStation = false;
        result.hasArrival = true;
        result.hasDeparture = true;
        // check if the estimated time is delayed
        result.delayedArrival = isDelayed(
          obj.timetabledArrival,
          obj.estimatedArrival,
        );
        result.delayedDeparture = isDelayed(
          obj.timetabledDeparture,
          obj.estimatedDeparture,
        );

        result.quay = ""; // init quay value

        // check if the quay has changed to a not planned quay
        if (obj.plannedQuay !== obj.estimatedQuay) {
          // check if the plannedQuay includes a /
          if (!String(obj.plannedQuay).includes("/")) {
            result.quayRed = true;
          }
        }

        // get the quay as string with the right prefix
        result.quay = quayToString(obj.estimatedQuay);

        // check the call as not undefined departure times
        result.hasDeparture = !(
          obj.timetabledDeparture === undefined ||
          obj.timetabledDeparture === ""
        );

        return result;
      });

      // set the lastOnward flag on the last object
      const lastOnward = parsedOnwardCalls[parsedOnwardCalls.length - 1];
      lastOnward.lastOnward = true;
      parsedOnwardCalls[parsedOnwardCalls.length - 1] = lastOnward;

      // set the secondLastOnward flag on the second last object
      const secondLastOnward = parsedOnwardCalls[parsedOnwardCalls.length - 2];
      // check if the element from the array is not undefined
      if (secondLastOnward !== undefined) {
        // set the flag and write it back to the array
        secondLastOnward.secondLastOnward = true;
        parsedOnwardCalls[parsedOnwardCalls.length - 2] = secondLastOnward;
      } else {
        // set the flag on the thisCall object
        parsedThisCall.secondLastOnward = true;
      }
    }

    // init array for all calls
    let calls = [];

    // set the calls array to the parsed previous calls if the hasPrevious flag is set
    if (props.stopEvent.hasPrevious) {
      calls = parsedPreviousCalls;
    }

    // add the parsed thisCall to the calls array
    calls.push(parsedThisCall);

    // add the onward calls to the calls array if the hasOnward flag is set.
    // otherwise set the lastOnward flag on the last element from the calls array
    if (props.stopEvent.hasOnward) {
      calls = calls.concat(parsedOnwardCalls);
    } else {
      // set the lastOnward flag on the last element of the calls array
      const lastCall = calls[calls.length - 1];
      lastCall.lastOnward = true;
      calls[calls.length - 1] = lastCall;
    }

    // set the parsed call reactive variable to the calls array
    parsedCalls.value = calls;
  }
</script>

<template>
  <div class="text-white flex flex-row justify-center">
    <div>
      <div class="text-center text-xl">
        {{ serviceName }}
      </div>
      <div v-for="(call, index) in parsedCalls" :key="index">
        <div class="mt-0.5">
          <div v-if="call.hasArrival" class="text-center">
            <div>
              {{ getTimeAsString(new Date(call.timetabledArrival), true) }}
            </div>
            <div
              class="font-bold"
              :style="{ color: call.delayedArrival ? 'red' : 'white' }"
            >
              {{ getTimeAsString(new Date(call.estimatedArrival), true) }}
            </div>
          </div>
          <div
            class="p-1 rounded-lg bg-gray-800 text-center"
            :class="{
              'bg-gray-900 border-2 border-gray-300': call.currentStation,
            }"
          >
            <div>
              {{ call.stationName }}
            </div>
            <div :style="{ color: call.quayRed ? 'red' : 'white' }">
              {{ call.quay }}
            </div>
          </div>

          <div v-if="call.hasDeparture" class="text-center">
            <div>
              {{ getTimeAsString(new Date(call.timetabledDeparture), true) }}
            </div>
            <div
              class="font-bold"
              :style="{ color: call.delayedDeparture ? 'red' : 'white' }"
            >
              {{ getTimeAsString(new Date(call.estimatedDeparture), true) }}
            </div>
          </div>
          <div class="flex flex-row justify-center mt-0.5">
            <svg v-if="!call.lastOnward" width="30" height="40">
              <line
                x1="15"
                x2="15"
                y1="0"
                y2="77"
                style="stroke: white; stroke-width: 5px"
              />
              <line
                v-if="call.lastPrevious || call.secondLastOnward"
                x1="0"
                x2="16"
                y1="20"
                y2="40"
                style="stroke: white; stroke-width: 5px"
              />
              <line
                v-if="call.lastPrevious || call.secondLastOnward"
                x1="30"
                x2="14"
                y1="20"
                y2="40"
                style="stroke: white; stroke-width: 5px"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
