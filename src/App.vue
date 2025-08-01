<script setup>
import { useApikeyStore } from "@/stores/ApikeyStore.js";
import Station from "@/components/Station.vue";

const apikeyStore = useApikeyStore();

</script>

<template>
  <div class="flex items-center flex-row justify-between bg-blue-400  rounded-2xl p-3 m-3">
    <RouterLink to="/arrdep" class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300" active-class="bg-white">
      Ankunft- und Abfahrtsanzeiger
    </RouterLink>
    <div>
      API-Key:
      <input placeholder="API-Key" type="password"
             class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
             v-model="apikeyStore.apikey">
    </div>
  </div>
  <RouterView/>
</template>

