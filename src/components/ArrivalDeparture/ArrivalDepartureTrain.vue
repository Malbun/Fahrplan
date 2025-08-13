<template>
  <div class="bg-gray-600 rounded-xl">
    <div @click="onClick()" class="flex items-center flex-row justify-between mt-3 p-1">
      <div class="timetabledTime" :id="timetabledID">{{ train.timetabled }}</div>
      <div class="estimatedTime" :id="estimatedID">{{ train.estimated }}</div>
      <div class="serviceName" :id="serviceNameID">{{ train.serviceName }}</div>
      <div class="originDestination" :id="originDestinationID">{{ train.originDestination }}</div>
      <div class="quay" :id="quayID">{{ quay }}</div>
    </div>
    <div :id="trackRunnerID" class="p-2">
      <div class="justify-items-center">
        <TrackRunner :id="props.id" :calls="props.train.calls" :current-station="props.train.currentStation" :arrival= "props.arrival" class="p-1 bg-gray-500 rounded-xl"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import TrackRunner from "@/components/TrackRunner/TrackRunner.vue";
import {onMounted, onUpdated, ref} from "vue";

const props = defineProps({
  train: Object,
  id: Number,
  arrival: Boolean,
})

const trackRunnerID = `ArrDepTrain${props.id}`;
const trackRunnerContainerID = `ArrDepTrainTrackRunnerContainer-${props.id}`;
const timetabledID = `ArrDepTrainTimetabled-${props.id}`;
const estimatedID = `ArrDepTrainEstimated-${props.id}`;
const serviceNameID = `ArrDepTrainServiceName-${props.id}`;
const originDestinationID = `ArrDepTrainOriginDestination-${props.id}`;
const quayID = `ArrDepTrainQuay-${props.id}`;

const quay = ref("");

//console.log(props.train);

onUpdated(() => {
  document.getElementById(trackRunnerID).style.display = "none";
  renderQuay();
});

onMounted(() => {
  renderQuay();
  document.getElementById(trackRunnerID).style.display = "none";
});

function renderQuay() {
  if (String(props.train.plannedQuay).includes('$!')) {
    const splitted = String(props.train.plannedQuay).split('$!');
    quay.value = splitted[1];
    if (!(props.train.plannedQuay).includes('/')) {
      document.getElementById(quayID).style.color = "#ff1e1e";
    }
  } else quay.value = props.train.plannedQuay;
}

function onClick() {
  if (!Object.hasOwn(props.train, "calls")) return;

  const trackRunnerContainer = document.getElementById(trackRunnerID);
  if (trackRunnerContainer.style.display === "none") {
    trackRunnerContainer.style.display = "block";
  } else {
    trackRunnerContainer.style.display = "none";
  }
}

</script>

<style scoped>

.timetabledTime {
  width: 16vw;
}

.estimatedTime {
  width: 20vw;
}

.serviceName {
  width: 15vw;
}

.originDestination {
  width: 37vw;
  display: block;
}

.quay {
  width: 12vw;
}
</style>