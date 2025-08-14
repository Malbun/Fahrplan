<script setup>
import {useApikeyStore} from "@/stores/ApikeyStore.js";
import {getDateAsString, getTimeAsString, inputStringToDate} from "@/utils/DateUtils.ts";
import {useDateStore} from "@/stores/DateStore.js";

const apikeyStore = useApikeyStore();
const dateStore = useDateStore();

// default dateTime
const now = new Date();
const localNow = new Date(now.getTime() + now.getTimezoneOffset());
const timeString = getTimeAsString(localNow, false);
const dateString = getDateAsString(localNow);
dateStore.set(`${dateString}T${timeString}`);

</script>

<template>
  <div>
    <div>
      <div class="flex flex-wrap items-center flex-row justify-between bg-blue-400  rounded-2xl p-3 m-3">
        <RouterLink to="/arrdep/" class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 m-0.5" active-class="bg-white">
          Ankunft- und Abfahrtsanzeiger
        </RouterLink>

        <div class="m-0.5">
          <label for="datetime-input">Datum/Uhrzeit: </label>
          <input type="datetime-local" placeholder="Datum/Uhrzeit" id="datetime-input" v-model="dateStore.date"
                 class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0">
        </div>
        <div class="m-0.5">
          <label for="apiKey-input">API-Key: </label>
          <input placeholder="API-Key" type="password" id="apiKey-input"
                 class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
                 v-model="apikeyStore.apikey">
        </div>
      </div>
      <RouterView/>
    </div>
    <div class="text-white m-4">
      This Website uses <a class="underline" href="https://data.opentransportdata.swiss/de/dataset/ojp2-0">OJP 2.0</a>. OJP uses <a class="underline" href="https://www.osm.org">OpenStreetMap</a>
    </div>
  </div>
</template>

