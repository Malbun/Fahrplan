<script setup>
  import { useApikeyStore } from "@/stores/ApikeyStore.js";
  import { getDateAsString, getTimeAsString } from "@/utils/DateUtils.ts";
  import { useDateStore } from "@/stores/DateStore.js";
  import { BsGithub } from "vue-icons-plus/bs";
  import { onMounted } from "vue";

  const apikeyStore = useApikeyStore();
  const dateStore = useDateStore();

  // default dateTime
  const now = new Date();
  const localNow = new Date(now.getTime() + now.getTimezoneOffset());
  const timeString = getTimeAsString(localNow, false);
  const dateString = getDateAsString(localNow);
  dateStore.set(`${dateString}T${timeString}`);

  onMounted(() => {
    if (
      !(
        sessionStorage.api === null ||
        sessionStorage.api === undefined ||
        sessionStorage.api === ""
      )
    ) {
      apikeyStore.set(sessionStorage.api);
    }
  });

  function keyChanged() {
    sessionStorage.api = String(apikeyStore.apikey);
  }
</script>

<template>
  <div class="cursor-default">
    <div>
      <div
        class="flex flex-wrap items-center flex-row justify-between bg-blue-400 rounded-2xl p-3 m-3"
      >
        <RouterLink
          to="/arrdep/"
          class="p-2 font-bold rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 m-0.5"
          active-class="bg-white"
        >
          Ankunft- und Abfahrtsanzeiger
        </RouterLink>
        <RouterLink
          to="/trip/"
          class="p-2 font-bold rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 m-0.5"
          active-class="bg-white"
        >
          Fahrplan
        </RouterLink>
        <div class="m-0.5">
          <label for="datetime-input">Datum/Uhrzeit:</label>
          <input
            id="datetime-input"
            v-model="dateStore.date"
            type="datetime-local"
            placeholder="Datum/Uhrzeit"
            class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
          />
        </div>
        <div class="m-0.5">
          <label for="apiKey-input">API-Key:</label>
          <input
            id="apiKey-input"
            v-model="apikeyStore.apikey"
            placeholder="API-Key"
            type="password"
            class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
            @input="keyChanged()"
          />
        </div>
      </div>
      <RouterView />
    </div>
    <div class="text-white m-4 space-x-1">
      This Website uses
      <a
        class="underline cursor-pointer"
        href="https://data.opentransportdata.swiss/de/dataset/ojp2-0"
      >
        OJP 2.0
      </a>
      OJP uses
      <a class="underline cursor-pointer" href="https://www.osm.org">
        OpenStreetMap
      </a>
      <br />
      <div class="flex flex-row space-x-2">
        <div>GitHub:</div>
        <a class="cursor-pointer" href="https://github.com/Malbun/Fahrplan">
          <BsGithub />
        </a>
      </div>
      <div>
        <a
          href="https://github.com/Malbun/Fahrplan/issues"
          class="underline cursor-pointer"
        >
          Report Issue
        </a>
      </div>
    </div>
  </div>
</template>
