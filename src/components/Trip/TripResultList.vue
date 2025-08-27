<script setup>
  import TripResult from "@/components/Trip/TripResult.vue";

  const props = defineProps({
    trips: { type: Array, required: true },
  });

  console.log(props.trips);
</script>

<template>
  <div v-for="trip in props.trips" :key="trip.id">
    <TripResult class="mt-2 p-1.5 rounded-xl bg-gray-600" :trip="trip" />
  </div>
</template>

<style scoped></style>
