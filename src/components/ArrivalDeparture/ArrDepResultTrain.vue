<script setup>
  import { onMounted, onUpdated, ref } from "vue";
  import { getDateAsString, getTimeAsString } from "@/utils/DateUtils.js";

  const props = defineProps({
    stopEvent: { type: Object, required: true },
  });

  console.log(props.stopEvent);

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
  const quayColor = ref("white");
  const serviceName = ref("IR13");

  onMounted(render);
  onUpdated(render);

  function render() {
    hasPrevious.value = props.stopEvent.hasPrevious;
    hasOnward.value = props.stopEvent.hasOnward;
    origin.value = props.stopEvent.origin;
    destination.value = props.stopEvent.destination;
    currentStation.value = props.stopEvent.thisCall.stationName;
    serviceName.value = props.stopEvent.serviceName;

    if (hasPrevious.value && hasOnward.value) {
      mobileTimeAlign.value = "center";
      timetabledArrival.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.timetabledArrival),
        true
      );
      estimatedArrival.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.estimatedArrival),
        true
      );
      timetabledDeparture.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.timetabledDeparture),
        true
      );
      estimatedDeparture.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.estimatedDeparture),
        true
      );
    }

    if (!hasPrevious.value && hasOnward.value) {
      mobileTimeAlign.value = "start";
      timetabledDeparture.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.timetabledDeparture),
        true
      );
      estimatedDeparture.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.estimatedDeparture),
        true
      );
    }

    if (hasPrevious.value && !hasOnward.value) {
      mobileTimeAlign.value = "end";
      timetabledArrival.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.timetabledArrival),
        true
      );
      estimatedArrival.value = getTimeAsString(
        new Date(props.stopEvent.thisCall.estimatedArrival),
        true
      );
    }
  }
</script>

<template>
  <div class="bg-gray-900 text-white p-2 mt-2 rounded-xl">
    <!-- desktop -->
    <div class="desktop">
      <div class="flex flex-col space-y-1">
        <div>{{ serviceName }}</div>
        <div class="flex flex-row space-x-2 justify-between items-center">
          <div v-if="hasPrevious" style="flex-shrink: 0">{{ origin }}</div>
          <div v-if="hasPrevious">
            <svg
              height="20px"
              width="auto"
              style="flex-shrink: 1; transform: scale(-1, 1)"
            >
              <line
                x1="5"
                x2="100%"
                y1="10"
                y2="10"
                style="stroke: white; stroke-width: 5px"
              />
              <line
                x1="20"
                x2="4"
                y1="20"
                y2="9"
                style="stroke: white; stroke-width: 5px"
              />
              <line
                x1="20"
                x2="4"
                y1="0"
                y2="11"
                style="stroke: white; stroke-width: 5px"
              />
            </svg>
          </div>
          <div
            class="flex flex-row space-x-2 items-center"
            style="flex-shrink: 0"
          >
            <div v-if="hasPrevious" style="flex-shrink: 0">
              <div>{{ timetabledArrival }}</div>
              <div class="font-bold">{{ estimatedArrival }}</div>
            </div>
            <div
              class="flex flex-col justify-center items-center bg-gray-700 p-1.5 rounded-xl"
              style="flex-shrink: 0"
            >
              <div class="">{{ currentStation }}</div>
              <div class="quayDisplay">{{ quay }}</div>
            </div>
            <div v-if="hasOnward" style="flex-shrink: 0">
              <div>{{ timetabledDeparture }}</div>
              <div class="font-bold">{{ estimatedDeparture }}</div>
            </div>
          </div>
          <div v-if="hasOnward">
            <svg
              height="20px"
              width="auto"
              style="flex-shrink: 1; transform: scale(-1, 1)"
            >
              <line
                x1="5"
                x2="100%"
                y1="10"
                y2="10"
                style="stroke: white; stroke-width: 5px"
              />
              <line
                x1="20"
                x2="4"
                y1="20"
                y2="9"
                style="stroke: white; stroke-width: 5px"
              />
              <line
                x1="20"
                x2="4"
                y1="0"
                y2="11"
                style="stroke: white; stroke-width: 5px"
              />
            </svg>
          </div>
          <div v-if="hasOnward" style="flex-shrink: 0">{{ destination }}</div>
        </div>
      </div>
    </div>

    <!-- mobile -->
    <div class="mobile">
      <div class="flex flex-row items-center justify-center space-x-2">
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
          <div class="flex flex-col space-y-0.5">
            <div v-if="hasPrevious">
              <div>{{ timetabledArrival }}</div>
              <div class="font-bold">{{ estimatedArrival }}</div>
            </div>
            <div class="quayDisplay" style="width: 50px; white-space: nowrap">
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
</template>

<style scoped>
  .dynamicAlign {
    align-items: v-bind("mobileTimeAlign");
  }

  .quayDisplay {
    color: v-bind("quayColor");
  }

  @media only screen and (max-width: 700px) {
    .mobile {
      display: inline;
    }

    .desktop {
      display: none;
    }
  }

  @media only screen and (min-width: 700px) {
    .mobile {
      display: none;
    }

    .desktop {
      display: inline;
    }
  }
</style>
