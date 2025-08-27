<script setup>
// imports
import { h, onMounted, onUpdated, render } from "vue";
import TimedLegView from "@/components/Trip/LegView/TimedLegView.vue";
import TransferLegView from "@/components/Trip/LegView/TransferLegView.vue";

// props
const props = defineProps({
  trip: { type: Object, required: true },
});

const legContainerId = `${props.trip.id}LegListLegContainerId`;

onMounted(update);

onUpdated(update);

function update() {
  //console.log(props.trip);

  const legContainer = document.getElementById(legContainerId);

  const displayLegs = [];
  let legCounter = 0;
  for (const leg of props.trip.legs) {
    if (leg["type"] === "timed") {
      const newTimedLegView = h(
        TimedLegView,
        { leg: leg, id: `${props.trip.id}LegView${legCounter}` },
        null,
      );
      displayLegs.push(newTimedLegView);
    } else {
      const newTransferLegView = h(
        TransferLegView,
        { leg: leg, id: `${props.trip.id}LegView${legCounter}` },
        null,
      );
      displayLegs.push(newTransferLegView);
    }
    legCounter += 1;
  }

  const mainVNode = h("div", displayLegs);
  render(mainVNode, legContainer);
}
</script>

<template>
  <div :id="legContainerId" class="bg-gray-500 p-2 rounded-xl"></div>
</template>

<style scoped></style>
