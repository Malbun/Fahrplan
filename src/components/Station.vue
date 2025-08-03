<template>
  <div class="flex flex-row items-center">
    <div class="mr-2">
      <label :for="inputElementId">{{title}}</label>
    </div>
    <div>
      <input type="text" placeholder="Bahnhof/Haltestelle" :id="inputElementId"
             class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
             @input="onChange($event.target.value)" @focusout="hideSuggestions()" @focus="showSuggestions()"/>
      <div class="absolute m-1 bg-white p-2 rounded-2xl suggestion" :id="suggestionsElementId">

      </div>
    </div>

  </div>
</template>

<script setup>
import stationData from '@/data/stationData.json';
import Fuse from 'fuse.js';
import {h, render} from "vue";


let mouseInSuggestions = 0;
let mouseOutSuggestions = 0;
let currentSuggestions = "Zürich HB";

const props = defineProps({
  store: Object,
  title: String,
  id: String,
})

const inputElementId = `input-${props.id}`;
const suggestionsElementId = `suggestions-${props.id}`;

props.store.set("");

const fuse = new Fuse(stationData, {
  includeScore: true,
  keys: ['a', 'l']
});

function onChange(element) {
  props.store.set(element);
  updateSuggestions();
}

function updateSuggestions() {
  const searchResult = fuse.search(document.getElementById(inputElementId).value);
  const shortenSearchResult = searchResult.slice(0, 10);

  const nodes = [];
  for (const singleResult of shortenSearchResult) {
    nodes.push(h('div', {
      onMouseenter: () => {
        mouseInSuggestions++;
        currentSuggestions = singleResult.item.l;
      },
      onMouseout: () => mouseOutSuggestions++,
      class: 'p-1 rounded-xl hover:bg-gray-200 duration-200 cursor-pointer',
    }, singleResult.item.l));
  }

  const nodeContainer = h('div', {}, nodes);
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
  }
}

</script>

<style scoped>
.suggestion {
  display: none;
}
</style>