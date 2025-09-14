<script setup>
  // imports
  import { getTimeAsString, isDelayed } from "@/utils/DateUtils.js";
  import { onMounted, onUpdated, ref } from "vue";
  import { BsPersonWalking } from "vue-icons-plus/bs";
  import LegList from "@/components/Trip/LegView/LegList.vue";

  // props
  const props = defineProps({
    trip: { type: Object, required: true },
  });

  // uniq IDs for all containers
  const walkPrefixId = `${props.trip.id}TripResultWalkPrefixId`; // contains the ID for a div who contains the walk icon and minute information before the trip
  const walkAfterId = `${props.trip.id}TripResultWalkAfterId`; // contains the ID for a div who contains the walk icon and minute information before the trip
  const quayId = `${props.trip.id}TripResultQuayId`; // contains the ID for the div who contains the quay text
  const legListId = `${props.trip.id}TripResultLegListId`; // contains the ID for the div who contains the leg list
  const mainContainerId = `${props.trip.id}TripResultContainer`; // contains the ID for the div who contains the whole result
  const startTimeId = `${props.trip.id}StartTime`; // contains the ID for the startTime display
  const endTimeId = `${props.trip.id}EndTime`; // contains the ID for the endTime display

  // reactive variables
  const serviceName = ref(""); // stores the name of the first service from the trip
  const trainDestination = ref(""); // stores the name of the terminal station from the first service
  const quay = ref(""); // stores the quay
  const walkPrefix = ref(""); // stores the minutes to walk before the first timed leg
  const walkAfter = ref(""); // stores the minutes to walk after the las timed leg
  const startTime = ref(""); // stores the time from the start from the first timed leg
  const endTime = ref(""); // stores the time after the last timed leg
  const duration = ref(""); // stores the duration from the whole trip

  onMounted(renderInformation); // renders all information after the component has been mounted

  onUpdated(() => {
    renderInformation(); // renders all information after the component has been updated
    document.getElementById(legListId).style.display = "none"; // hide the leg list
  });

  // displays all information
  function renderInformation() {
    const rawDuration = props.trip.duration; // access the duration in minutes
    const hours = Math.floor(rawDuration / 60); // calculate the whole hours from the raw duration
    const minutes = rawDuration % 60; // calculate the remaining minutes from the raw duration

    // checks if the trip has a cancelled leg
    if (props.trip.cancelled) {
      document.getElementById(mainContainerId).classList.add("border-red-600"); // set the border color of the main container to red
      document.getElementById(mainContainerId).classList.add("border-3"); // display a border on the main container
    }

    if (hours === 0) {
      // checks if hours is 0
      duration.value = `${minutes}min`; // only adds minutes to string
    } else {
      // has 1 or more hours
      duration.value = `${hours}h ${minutes}min`; // adds hours and minutes to string
    }

    if (props.trip.legs[0].type === "timed") {
      // checks if the first leg is a timed leg
      renderFirstTimedLeg(0); // renders the first leg with the index for the first timed leg
      document.getElementById(walkPrefixId).style.display = "none"; // hide the icon and time for walking before the first leg
    } else {
      // the first leg is a transfer leg
      renderFirstTimedLeg(1); // renders the first leg with the index for the first timed leg
      walkPrefix.value = "'" + props.trip.legs[0].duration; // set the minutes to walk before the first timed leg to the duration of the first transfer leg
      document.getElementById(walkPrefixId).style.display = "flex"; // display the prefix icon and time
    }

    // checks if the last leg is a transfer leg
    if (props.trip.legs[props.trip.legs.length - 1].type === "transfer") {
      renderDelayOnLastTimedLeg(2); // render delay
      endTime.value = props.trip.legs[props.trip.legs.length - 2].endTime; // sets the end time to the end time of the last timed leg
      walkAfter.value =
        "'" + props.trip.legs[props.trip.legs.length - 1].duration; // set the time to walk after the last timed leg to the duration of the last transfer leg
      document.getElementById(walkAfterId).style.display = "flex"; // display the walk icon and the time after the last timed leg
    } else {
      // last leg is a timed leg
      renderDelayOnLastTimedLeg(1); // render delay
      document.getElementById(walkAfterId).style.display = "none"; // hide the walk icon and the time after the last timed leg
      endTime.value = props.trip.legs[props.trip.legs.length - 1].endTime; // set the end time to the end time of the last timed leg
    }
  }

  // renders a possible delay in the last leg
  function renderDelayOnLastTimedLeg(index) {
    // check if the train is delayed
    if (
      isDelayed(
        props.trip.legs[props.trip.legs.length - index].endTime,
        props.trip.legs[props.trip.legs.length - index].endTimeTimetabled,
      )
    ) {
      document.getElementById(endTimeId).style.color = "#ff1e1e"; // change text color from the time display to red
    }
  }

  // renders the information about the first timed leg
  function renderFirstTimedLeg(index) {
    startTime.value = props.trip.legs[index].startTime; // set the start time to the start time of the first timed leg

    // check if the train is delayed
    if (
      isDelayed(
        props.trip.legs[index].startTime,
        props.trip.legs[index].startTimeTimetabled,
      )
    ) {
      document.getElementById(startTimeId).style.color = "#ff1e1e"; // change text color from the time display to red
    }

    let prefix = ""; // init variable for the prefix for the line name
    if (props.trip.legs[index].ptMode !== "rail") {
      // checks if the leg mod (transport vehicle type) isn't a train
      prefix = `${props.trip.legs[index].modeShort} `; // add the prefix from the mode short value to the prefix variable
    }
    serviceName.value = `${prefix}${props.trip.legs[index].serviceName}`; // set the service name to the prefix and the service name given by the trip

    trainDestination.value = `Richtung: ${props.trip.legs[index].trainDestination}`; // set the train destination to the terminal station of the leg vehicle

    const firstCall = props.trip.legs[index].calls[0]; // get the first stop call from this leg
    let tempQuay = ""; // init variable to temporally store and edit the quay

    if (firstCall.order === 1) {
      // check if the first call is also the first in the order
      tempQuay = String(firstCall.plannedQuay); // load tempQuay with the provided quay
    }

    if (tempQuay.includes("$!")) {
      // checks if an estimated quay exists
      if (!tempQuay.includes("/")) {
        // checks if the estimated quay has to be displayed as a quay change (ref. ZMUS)
        document.getElementById(quayId).style.color = "#ff1e1e"; // set the color of the quay text to red
      }
      tempQuay = tempQuay.split("$!")[1]; // set the temp variable to the estimated quay
    }

    if (tempQuay !== "" && /\d/.test(tempQuay)) {
      // checks if the temp variable isn't empty and contains a digit
      quay.value = `Gleis: ${tempQuay}`; // set quay text to Gleis: tempQuay
    } else if (tempQuay !== "" && !/\d/.test(tempQuay)) {
      // checks if the temp variable isn't empty and does not contain any digits
      quay.value = `Kante: ${tempQuay}`; // set quay text to Kante: tempQuay
    } else {
      // tempQuay is empty
      quay.value = tempQuay; // set quay text to empty string
    }
  }

  // executed if the trip result item is clicked
  // hides and restores the leg list
  function clicked() {
    if (document.getElementById(legListId).style.display === "none") {
      // check if the leg list container is hided
      document.getElementById(legListId).style.display = "inline-block"; // restore it
    } else {
      // is restored
      document.getElementById(legListId).style.display = "none"; // hide it
    }
  }
</script>

<template>
  <div :id="mainContainerId" class="flex flex-col space-y-0.5 bg-gray-600">
    <div @click="clicked()">
      <div class="flex flex-row space-x-2">
        <div>{{ serviceName }}</div>
        <div>{{ trainDestination }}</div>
      </div>
      <div class="flex flex-row justify-between">
        <div class="flex flex-row">
          <div :id="walkPrefixId" class="flex flex-row mr-2">
            <BsPersonWalking />
            <div>{{ walkPrefix }}</div>
          </div>
          <div :id="startTimeId">
            {{ getTimeAsString(new Date(startTime)) }}
          </div>
        </div>
        <div>{{ duration }}</div>
        <div class="flex flex-row" style="width: 90px">
          <div :id="endTimeId">{{ getTimeAsString(new Date(endTime)) }}</div>
          <div :id="walkAfterId" class="flex flex-row ml-1">
            <BsPersonWalking />
            <div>{{ walkAfter }}</div>
          </div>
        </div>
      </div>
      <div class="flex flex-row justify-between">
        <div :id="quayId">{{ quay }}</div>
      </div>
    </div>
    <div :id="legListId" style="display: none">
      <LegList :trip="props.trip" />
    </div>
  </div>
</template>

<style scoped></style>
