<script setup>
import {onMounted, onUpdated} from "vue";

const props = defineProps({
  trip: Object,
})

const legContainerId = `${props.trip.id}LegListLegContainerId`;

onMounted(update);

onUpdated(update);

function update() {

}

</script>

<template>
<div class="bg-gray-500 p-2 rounded-xl" :id="legContainerId">

</div>
</template>

<style scoped>

</style>