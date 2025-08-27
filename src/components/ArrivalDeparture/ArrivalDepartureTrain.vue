<template>
  <div class="bg-gray-600 rounded-xl">
    <div
      class="flex items-center flex-row justify-between mt-3 p-1"
      @click="onClick()"
    >
      <div :id="timetabledID" class="timetabledTime">
        {{ train.timetabled }}
      </div>
      <div :id="estimatedID" class="estimatedTime">{{ train.estimated }}</div>
      <div :id="serviceNameID" class="serviceName">{{ train.serviceName }}</div>
      <div :id="originDestinationID" class="originDestination">
        {{ train.originDestination }}
      </div>
      <div :id="quayID" class="quay">{{ quay }}</div>
    </div>
    <div :id="trackRunnerID" class="p-2">
      <div class="justify-items-center">
        <TrackRunner
          :id="props.id"
          :calls="props.train.calls"
          :current-station="props.train.currentStation"
          :arrival="props.arrival"
          :use-click="true"
          class="p-1 bg-gray-500 rounded-xl"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import TrackRunner from "@/components/TrackRunner/TrackRunner.vue";
  import { onMounted, onUpdated, ref } from "vue";

  const props = defineProps({
    train: { type: Object, required: true },
    id: { type: Number, required: true },
    arrival: { type: Boolean, required: true },
  });

  const trackRunnerID = `ArrDepTrain${props.id}`;
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
    if (String(props.train.plannedQuay).includes("$!")) {
      const splitted = String(props.train.plannedQuay).split("$!");
      quay.value = splitted[1];
      if (!props.train.plannedQuay.includes("/")) {
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
