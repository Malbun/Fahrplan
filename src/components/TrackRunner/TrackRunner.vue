<template>
  <div :id="mainContainerId"></div>
</template>

<script setup>
  import { h, onMounted, onUpdated, render } from "vue";
  import TrackRunnerCall from "@/components/TrackRunner/TrackRunnerCall.vue";
  import { getTimeAsString } from "@/utils/DateUtils.js";

  const props = defineProps({
    calls: { type: Object, required: true },
    id: { type: String, required: true },
    arrival: { type: Boolean, required: true },
    currentStation: { type: Number, required: true },
  });

  const mainContainerId = `TrackRunnerMainContainer-${props.id}`;
  let runnerCounter = -1;

  onMounted(showView);

  onUpdated(showView);

  function showView() {
    runnerCounter++;
    const nodes = [];

    for (const station of props.calls) {
      // Checking for current mode
      if (props.arrival) {
        // Checking if stop should be displayed
        if (props.currentStation > station.order) {
          const currentProps = {
            id: `TrackRunner-${props.id}:Call-${runnerCounter}`,
            name: station.name,
            timetabledArrival: getTimeAsString(
              new Date(station.timetabledArrival),
              true,
            ),
            estimatedArrival: getTimeAsString(
              new Date(station.estimatedArrival),
              true,
            ),
            timetabledDeparture: getTimeAsString(
              new Date(station.timetabledDeparture),
              true,
            ),
            estimatedDeparture: getTimeAsString(
              new Date(station.estimatedDeparture),
              true,
            ),
            quay: String(station.plannedQuay),
            useClick: false,
          };
          nodes.push(h(TrackRunnerCall, currentProps, null));
        }
      } else {
        //console.log(station);
        if (props.currentStation < station.order) {
          const currentProps = {
            name: station.name,
            timetabledArrival: getTimeAsString(
              new Date(station.timetabledArrival),
              true,
            ),
            estimatedArrival: getTimeAsString(
              new Date(station.estimatedArrival),
              true,
            ),
            timetabledDeparture: getTimeAsString(
              new Date(station.timetabledDeparture),
              true,
            ),
            estimatedDeparture: getTimeAsString(
              new Date(station.estimatedDeparture),
              true,
            ),
            quay: String(station.plannedQuay),
            useClick: true,
          };
          nodes.push(h(TrackRunnerCall, currentProps, null));
        }
      }
    }

    if (props.calls.length > 0) {
      const mainContainer = document.getElementById(mainContainerId);
      const rootVNode = h("div", {}, nodes);
      render(rootVNode, mainContainer);
    }
  }
</script>

<style scoped></style>
