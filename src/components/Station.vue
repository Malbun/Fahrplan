<template>
  <div class="flex flex-row items-center">
    <div class="mr-2">
      <label :for="inputElementId">{{ title }}</label>
    </div>
    <div>
      <input
        :id="inputElementId"
        type="text"
        placeholder="Bahnhof/Haltestelle"
        class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
        @input="onChange($event.target.value)"
        @focusout="hideSuggestions()"
        @focus="showSuggestions()"
      />
      <div
        :id="suggestionsElementId"
        class="absolute m-1 bg-white p-2 rounded-2xl suggestion"
      ></div>
    </div>
  </div>
</template>

<script setup>
  import stationData from "@/data/stationData.json";
  import Fuse from "fuse.js";
  import { h, render } from "vue";

  let mouseInSuggestions = 0;
  let mouseOutSuggestions = 0;
  let currentSuggestions = "Zürich HB";

  const props = defineProps({
    store: { type: Object, required: true },
    title: { type: String, required: true },
    id: { type: String, required: true },
    changed: { type: Function, required: false, default: () => false },
  });

  const inputElementId = `StationInput-${props.id}`;
  const suggestionsElementId = `StationSuggestions-${props.id}`;

  props.store.set("");

  const fuse = new Fuse(stationData, {
    includeScore: true,
    keys: ["a", "l"],
  });

  function onChange(element) {
    props.store.set(element);
    updateSuggestions();
    props.changed();
  }

  function updateSuggestions() {
    const searchResult = fuse.search(
      document.getElementById(inputElementId).value,
    );
    const shortenSearchResult = searchResult.slice(0, 10);

    const nodes = [];
    for (const singleResult of shortenSearchResult) {
      nodes.push(
        h(
          "div",
          {
            onMouseenter: () => {
              mouseInSuggestions++;
              currentSuggestions = singleResult.item.l;
            },
            onMouseout: () => mouseOutSuggestions++,
            class:
              "p-1 rounded-xl hover:bg-gray-200 duration-200 cursor-pointer",
          },
          singleResult.item.l,
        ),
      );
    }

    const nodeContainer = h("div", {}, nodes);
    const suggestionContainer = document.getElementById(suggestionsElementId);
    render(nodeContainer, suggestionContainer);
  }

  function showSuggestions() {
    updateSuggestions();
    const input = document.getElementById(suggestionsElementId);
    input.style.display = "block";
  }

  function hideSuggestions() {
    const input = document.getElementById(suggestionsElementId);
    input.style.display = "none";

    if (mouseInSuggestions === mouseOutSuggestions + 1) {
      document.getElementById(inputElementId).value = currentSuggestions;
      props.store.set(currentSuggestions);
      props.changed();
    }
  }
</script>

<style scoped>
  .suggestion {
    display: none;
    z-index: 5;
  }
</style>
