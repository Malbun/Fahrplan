<script setup>
  import { onMounted, ref } from "vue";
  import { quayToString } from "@/utils/ArrivalDeparture.js";
  import { getTimeAsString, isDelayed } from "@/utils/DateUtils.js";

  const props = defineProps({
    stopEvent: { type: Object, required: true },
  });

  const serviceName = ref("");
  const parsedCalls = ref([]);

  onMounted(render);

  function render() {
    serviceName.value = props.stopEvent.serviceName;

    let parsedPreviousCalls = [];
    let parsedThisCall = {};
    let parsedOnwardCalls = [];

    if (props.stopEvent.hasPrevious) {
      parsedPreviousCalls = props.stopEvent.previousCall.map((obj) => {
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
        result.delayedArrival = isDelayed(
          obj.timetabledArrival,
          obj.estimatedArrival,
        );
        result.delayedDeparture = isDelayed(
          obj.timetabledDeparture,
          obj.estimatedDeparture,
        );
        result.quay = "0";

        if (obj.plannedQuay !== obj.estimatedQuay) {
          // check if the plannedQuay includes a /
          if (!String(obj.plannedQuay).includes("/")) {
            result.quayRed = true;
          }
        }

        result.quay = quayToString(obj.estimatedQuay);

        result.hasArrival = !(
          obj.timetabledArrival === undefined ||
          obj.estimatedArrival === undefined
        );

        return result;
      });

      const lastPreviousCall =
        parsedPreviousCalls[parsedPreviousCalls.length - 1];
      lastPreviousCall.lastPrevious = true;
      parsedPreviousCalls[parsedPreviousCalls.length - 1] = lastPreviousCall;
    }

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
    parsedThisCall.delayedArrival = isDelayed(
      props.stopEvent.thisCall.timetabledArrival,
      props.stopEvent.thisCall.estimatedArrival,
    );
    parsedThisCall.delayedDeparture = isDelayed(
      props.stopEvent.thisCall.timetabledDeparture,
      props.stopEvent.thisCall.estimatedDeparture,
    );
    parsedThisCall.quay = "0";

    if (
      props.stopEvent.thisCall.plannedQuay !==
      props.stopEvent.thisCall.estimatedQuay
    ) {
      // check if the plannedQuay includes a /
      if (!String(props.stopEvent.thisCall.plannedQuay).includes("/")) {
        parsedThisCall.quayRed = true;
      }
    }

    parsedThisCall.quay = quayToString(props.stopEvent.thisCall.estimatedQuay);

    if (props.stopEvent.hasOnward) {
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
        result.delayedArrival = isDelayed(
          obj.timetabledArrival,
          obj.estimatedArrival,
        );
        result.delayedDeparture = isDelayed(
          obj.timetabledDeparture,
          obj.estimatedDeparture,
        );
        result.quay = "0";

        if (obj.plannedQuay !== obj.estimatedQuay) {
          // check if the plannedQuay includes a /
          if (!String(obj.plannedQuay).includes("/")) {
            result.quayRed = true;
          }
        }

        result.quay = quayToString(obj.estimatedQuay);

        result.hasDeparture = !(
          obj.timetabledDeparture === undefined ||
          obj.timetabledDeparture === ""
        );

        return result;
      });

      const lastOnward = parsedOnwardCalls[parsedOnwardCalls.length - 1];
      lastOnward.lastOnward = true;
      parsedOnwardCalls[parsedOnwardCalls.length - 1] = lastOnward;

      const secondLastOnward = parsedOnwardCalls[parsedOnwardCalls.length - 2];
      if (secondLastOnward !== undefined) {
        secondLastOnward.secondLastOnward = true;
        parsedOnwardCalls[parsedOnwardCalls.length - 2] = secondLastOnward;
      } else {
        parsedThisCall.secondLastOnward = true;
      }
    }

    let calls = [];

    if (props.stopEvent.hasPrevious) {
      calls = parsedPreviousCalls;
    }

    calls.push(parsedThisCall);

    if (props.stopEvent.hasOnward) {
      calls = calls.concat(parsedOnwardCalls);
    } else {
      const lastCall = calls[calls.length - 1];
      lastCall.lastOnward = true;
      calls[calls.length - 1] = lastCall;
    }

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
            {{ call.stationName }}
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
