<template>
  <div class="flex flex-row space-x-1 items-center pr-2">
    <div>
      <svg width="50" height="120">
        <line
          x1="25"
          y1="120"
          x2="25"
          y2="0"
          style="stroke: black; stroke-width: 5px"
        />
        <circle cx="25" cy="60" r="10" />
        <circle cx="25" cy="60" r="7" fill="lightgray" />
      </svg>
    </div>
    <div>
      <div class="flex flex-row space-x-1">
        <div>{{ props.timetabledArrival }}</div>
        <div>{{ props.estimatedArrival }}</div>
      </div>
      <div @click="click()">{{ props.name }}</div>
      <div :id="quayFieldId">{{ displayQuay }}</div>
      <div class="flex flex-row space-x-1">
        <div>{{ props.timetabledDeparture }}</div>
        <div>{{ props.estimatedDeparture }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useStationStore } from "@/stores/StationStore.js";
  import { useDateStore } from "@/stores/DateStore.js";
  import { getDateAsString } from "@/utils/DateUtils.js";
  import { onMounted, onUpdated, ref } from "vue";

  const props = defineProps({
    id: { type: String, required: true },
    name: { type: String, required: true },
    timetabledArrival: { type: String, required: true },
    estimatedArrival: { type: String, required: true },
    timetabledDeparture: { type: String, required: true },
    estimatedDeparture: { type: String, required: true },
    quay: { type: String, required: true },
    useClick: { type: Boolean, required: true },
  });

  const stationStore = useStationStore();
  const dateStore = useDateStore();

  const quayFieldId = `QuayField-${props.id}`;

  const displayQuay = ref("");

  onUpdated(renderQuay);

  onMounted(renderQuay);

  function renderQuay() {
    let quayDecorator;

    if (/\d/.test(props.quay)) {
      quayDecorator = "Gleis: ";
    } else if (props.quay === "") {
      quayDecorator = "";
    } else {
      quayDecorator = "Kante: ";
    }

    if (props.quay.includes("$!")) {
      if (!props.quay.includes("/")) {
        displayQuay.value = quayDecorator + props.quay.split("$!")[1];
        document.getElementById(quayFieldId).style.color = "#ff1e1e";
      } else {
        displayQuay.value = quayDecorator + props.quay.split("$!")[1];
      }
    } else {
      displayQuay.value = quayDecorator + props.quay;
    }
  }

  function click() {
    if (props.useClick) {
      let now = new Date(dateStore.date);
      let provDate = new Date(
        getDateAsString(now) + "T" + props.estimatedArrival,
      );
      if (provDate.getTime() < now.getTime()) {
        now.setDate(now.getDate() + 1);
        provDate = new Date(
          getDateAsString(now) + "T" + props.estimatedArrival,
        );
      }

      dateStore.date = getDateAsString(provDate) + "T" + props.estimatedArrival;

      document.getElementById("input-arrdep").value = props.name;
      stationStore.station = props.name;

      document.getElementById("departureSearchButton").click();
    }
  }
</script>

<style scoped></style>
