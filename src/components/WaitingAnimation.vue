<template>
  <div class="flex flex-row justify-center">
    <div class="icon-container content-center">
      <PiTrainSimpleBold class="text-white icon"/>
    </div>
  </div>
</template>

<style scoped>

.icon-container {
  width: 50px;
  height: 50px;
}

.icon {
  animation-name: pulse;
  animation-duration: 2.5s;
  animation-iteration-count: infinite;
}

@keyframes pulse {
  0% {
    transform : scale(1) rotate(0deg);
  }
  25% {
    transform : scale(2) rotate(0deg);
  }
  75% {
    transform : scale(2) rotate(360deg);
  }
  100% {
    transform : scale(1) rotate(360deg);
  }
}

</style>

<script setup>

import {PiTrainSimpleBold} from "vue-icons-plus/pi";

</script>