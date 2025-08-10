<template>
  <div class="flex flex-row space-x-1 items-center pr-2">
    <div>
      <svg width="50" height="100">
        <line x1="25" y1="100" x2="25" y2="0" style="stroke: black; stroke-width: 5px"/>
        <circle cx="25" cy="50" r="10"/>
        <circle cx="25" cy="50" r="7" fill="lightgray"/>
      </svg>
    </div>
    <div>
      <div class="flex flex-row space-x-1">
        <div>{{props.timetabledArrival}}</div>
        <div>{{props.estimatedArrival}}</div>
      </div>
      <div @click="click()">{{props.name}}</div>
      <div class="flex flex-row space-x-1">
        <div>{{props.timetabledDeparture}}</div>
        <div>{{props.estimatedDeparture}}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useStationStore} from "@/stores/StationStore.js";
import {useDateStore} from "@/stores/DateStore.js";
import {getDateAsString} from "@/utils/DateUtils.js";

const props = defineProps({
  name: String,
  timetabledArrival: String,
  estimatedArrival: String,
  timetabledDeparture: String,
  estimatedDeparture: String,
  useClick: Boolean,
})

const stationStore = useStationStore();
const dateStore = useDateStore();

function click() {
  if (props.useClick) {
    let now = new Date(dateStore.date);
    let provDate = new Date(getDateAsString(now) + "T" + props.estimatedArrival);
    if (provDate.getTime() < now.getTime()) {
      now.setDate(now.getDate() + 1);
      provDate = new Date(getDateAsString(now) + "T" + props.estimatedArrival);
    }

    dateStore.date = getDateAsString(provDate) + "T" + props.estimatedArrival;

    document.getElementById("input-arrdep").value = props.name;
    stationStore.station = props.name;

    document.getElementById("departureSearchButton").click();
  }
}
</script>

<style scoped>

</style>