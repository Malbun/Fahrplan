<template>
  <div class="flex items-center flex-row justify-between bg-gray-600 mt-3 p-1 rounded-xl">
    <div class="prop-view">{{ train.timetabledDeparture }}</div>
    <div class="prop-view">{{ train.estimatedDeparture }}</div>
    <div class="prop-view">{{ train.serviceName }}</div>
    <div class="prop-view">{{ train.destination }}</div>
    <div class="quay-view">{{ train.plannedQuay }}</div>
  </div>
</template>

<script setup>
defineProps({
  train: Object,
})

</script>

<style scoped>
.prop-view {
  width: 23.5vw;
}
.quay-view {
  width: 6vw;
}
</style>