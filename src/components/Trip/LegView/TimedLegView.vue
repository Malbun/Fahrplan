<script setup>
import { onMounted, onUpdated, ref } from "vue";
import { getTimeAsString } from "@/utils/DateUtils.js";

const props = defineProps({
  leg: { type: Object, required: true },
  id: { type: String, required: true },
});

const originQuayId = `${props.id}originQuay`;
const destinationQuayId = `${props.id}destinationQuay`;
const serviceName = ref("");

const originQuay = ref("");
const destinationQuay = ref("");
const duration = ref("");

onMounted(renderInformation);
onUpdated(renderInformation);

function renderInformation() {
  //console.log(props.leg);

  const rawDuration = props.leg.duration; // access the duration in minutes
  const hours = Math.floor(rawDuration / 60); // calculate the whole hours from the raw duration
  const minutes = rawDuration % 60; // calculate the remaining minutes from the raw duration

  if (hours === 0) {
    // checks if hours is 0
    duration.value = `${minutes}min`; // only adds minutes to string
  } else {
    // has 1 or more hours
    duration.value = `${hours}h ${minutes}min`; // adds hours and minutes to string
  }

  let prefix = ""; // init variable for the prefix for the line name
  if (props.leg.ptMode !== "rail") {
    // checks if the leg mod (transport vehicle type) isn't a train
    prefix = `${props.leg.modeShort} `; // add the prefix from the mode short value to the prefix variable
  }
  serviceName.value = `${prefix}${props.leg.serviceName}`; // set the service name to the prefix and the service name given by the trip

  let tempQuay1 = props.leg.calls[0].quay;
  if (tempQuay1.includes("$!")) {
    // checks if an estimated quay exists
    if (!tempQuay1.includes("/")) {
      // checks if the estimated quay has to be displayed as a quay change (ref. ZMUS)
      document.getElementById(originQuayId).style.color = "#ff1e1e"; // set the color of the quay text to red
      document.getElementById(originQuayId).style.fontWeight = "bold"; // set the font of the quay text to bold
    }
    tempQuay1 = tempQuay1.split("$!")[1]; // set the temp variable to the estimated quay
  }

  if (tempQuay1 !== "" && /\d/.test(tempQuay1)) {
    // checks if the temp variable isn't empty and contains a digit
    originQuay.value = `Gleis: ${tempQuay1}`; // set quay text to Gleis: tempQuay
  } else if (tempQuay1 !== "" && !/\d/.test(tempQuay1)) {
    // checks if the temp variable isn't empty and does not contain any digits
    originQuay.value = `Kante: ${tempQuay1}`; // set quay text to Kante: tempQuay
  } else {
    // tempQuay is empty
    originQuay.value = tempQuay1; // set quay text to empty string
  }

  let tempQuay2 = props.leg.calls[props.leg.calls.length - 1].quay;
  if (tempQuay2.includes("$!")) {
    // checks if an estimated quay exists
    if (!tempQuay2.includes("/")) {
      // checks if the estimated quay has to be displayed as a quay change (ref. ZMUS)
      document.getElementById(destinationQuayId).style.color = "#ff1e1e"; // set the color of the quay text to red
      document.getElementById(destinationQuayId).style.fontWeight = "bold"; // set the font of the quay text to bold
    }
    tempQuay2 = tempQuay2.split("$!")[1]; // set the temp variable to the estimated quay
  }

  if (tempQuay2 !== "" && /\d/.test(tempQuay2)) {
    // checks if the temp variable isn't empty and contains a digit
    destinationQuay.value = `Gleis: ${tempQuay2}`; // set quay text to Gleis: tempQuay
  } else if (tempQuay2 !== "" && !/\d/.test(tempQuay2)) {
    // checks if the temp variable isn't empty and does not contain any digits
    destinationQuay.value = `Kante: ${tempQuay2}`; // set quay text to Kante: tempQuay
  } else {
    // tempQuay is empty
    destinationQuay.value = tempQuay2; // set quay text to empty string
  }
}
</script>

<template>
  <div
    class="flex flex-row justify-between mb-1 mt-1 bg-gray-600 p-1.5 rounded-xl text-white"
  >
    <div class="flex flex-row">
      <div class="flex flex-col justify-between">
        <div class="font-bold">
          {{ getTimeAsString(new Date(props.leg.startTime)) }}
        </div>
        <div>{{ duration }}</div>
        <div>{{ getTimeAsString(new Date(props.leg.endTime)) }}</div>
      </div>
      <div class="ml-1 mr-1">
        <svg width="20" height="80">
          <line
            x1="10"
            y1="10"
            x2="10"
            y2="72"
            style="stroke: black; stroke-width: 4px"
          />
          <circle r="7" cx="10" cy="10" fill="black" />
          <circle r="4" cx="10" cy="10" fill="#dddddd" />
        </svg>
      </div>
      <div class="flex flex-col justify-between">
        <div class="font-bold">{{ props.leg.origin }}</div>
        <div class="flex flex-row space-x-1.5">
          <div>{{ serviceName }}</div>
          <div>{{ `Richtung: ${props.leg.trainDestination}` }}</div>
        </div>
        <div>{{ props.leg.destination }}</div>
      </div>
    </div>
    <div class="flex flex-col justify-between mr-2">
      <div>{{ originQuay }}</div>
      <div>{{ destinationQuay }}</div>
    </div>
  </div>
</template>

<style scoped></style>
