<script setup>
  import { onMounted, ref } from "vue";
  import { BsPersonWalking } from "vue-icons-plus/bs";

  const props = defineProps({
    leg: { type: Object, required: true },
    id: { type: String, required: true },
  });

  onMounted(renderInformation);

  const displayIcon = ref(true);
  const displayMinutes = ref(true);
  const text = ref("");

  function renderInformation() {
    //console.log(props.leg);

    if (props.leg.start !== props.leg.end) {
      text.value = "Fussweg";
      displayIcon.value = true;
      displayMinutes.value = true;
    } else {
      text.value = "Umsteigen";
      displayIcon.value = true;
      displayMinutes.value = false;
    }

    if (props.leg.transferType === "remainInVehicle") {
      text.value = "Im Fahrzeug bleiben";
      displayIcon.value = false;
      displayMinutes.value = false;
    }

    if (props.leg.transferType === "changeWithinVehicle") {
      text.value = "Richtiger Zugteil";
      displayIcon.value = false;
      displayMinutes.value = false;
    }
  }
</script>

<template>
  <div class="bg-gray-600 p-1.5 rounded-xl mt-1.5 mb-1.5">
    <div class="flex flex-row space-x-3">
      <div class="flex flex-row">
        <BsPersonWalking v-if="displayIcon" />
        <div v-if="displayMinutes">{{ `${props.leg.duration}'` }}</div>
      </div>
      <div>{{ text }}</div>
    </div>
  </div>
</template>

<style scoped></style>
