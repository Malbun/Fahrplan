<template>
  <div id="root">
    <button @click="run" class="bg-blue-300 text-black p-1.5 rounded-xl cursor-pointer">Suchen</button>
    <div class="mt-3 ml-1" id="resultContainer">
    </div>
  </div>
</template>

<script setup>
import { useApikeyStore } from "@/stores/ApikeyStore.js";
import {useStationStore} from "@/stores/StationStore.js";
import { useResultCountStore } from "@/stores/ResultCountStore.js";
import { XMLParser } from "fast-xml-parser";
import { h, render } from "vue";
import DepartureTrain from "./DepartureTrain.vue";


const apikeyStore = useApikeyStore();
const stationStore = useStationStore();
const resultCountStore = useResultCountStore();

async function run() {

  const didokRequestURL = `https://data.sbb.ch/api/explore/v2.1/catalog/datasets/dienststellen-gemass-opentransportdataswiss/records?select=designationofficial, number&limit=20&refine=designationofficial:${stationStore.station}`
  const didokResult = await fetch(didokRequestURL, {
    method: "GET"
  })
      .then(res => res.text())
      .then(json => {
        return JSON.parse(json);
      })
      .then(jsObject => {
        const result = {};
        result.didok = jsObject["results"][0]["number"];
        result.stationName = jsObject["results"][0]["designationofficial"];
        return result;
      });

  const currentDate = new Date();

  const body = `
  <OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="http://www.vdv.de/ojp" version="2.0">
    <OJPRequest>
        <siri:ServiceRequest>
            <siri:ServiceRequestContext>
                <siri:Language>de</siri:Language>
            </siri:ServiceRequestContext>
            <siri:RequestTimestamp>${currentDate.toISOString()}</siri:RequestTimestamp>
            <siri:RequestorRef>Malbun</siri:RequestorRef>
            <OJPStopEventRequest>
                <siri:RequestTimestamp>${currentDate.toISOString()}</siri:RequestTimestamp>
                <siri:MessageIdentifier>MalbunFahrplan</siri:MessageIdentifier>
                <Location>
                    <PlaceRef>
                        <siri:StopPointRef>${didokResult.didok}</siri:StopPointRef>
                        <Name>
                            <Text>${didokResult.stationName}</Text>
                        </Name>
                    </PlaceRef>
                    <DepArrTime>${currentDate.toISOString()}</DepArrTime>
                </Location>
                <Params>
                    <NumberOfResults>${Math.floor(resultCountStore.resultCount)}</NumberOfResults>
                    <StopEventType>departure</StopEventType>
                    <IncludePreviousCalls>true</IncludePreviousCalls>
                    <IncludeOnwardCalls>true</IncludeOnwardCalls>
                    <UseRealtimeData>full</UseRealtimeData>
                </Params>
            </OJPStopEventRequest>
        </siri:ServiceRequest>
    </OJPRequest>
</OJP>`


  const parsedResults = await fetch("https://api.opentransportdata.swiss/ojp20", {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/xml",
      "authorization": "Bearer " + apikeyStore.apikey,
    }
  })
      .then(res => res.text())
      .then(xml => {
        const parser = new XMLParser();
        return parser.parse(xml);
      })
      .then(jsObject => {
        const stopEventResults = jsObject["OJP"]["OJPResponse"]["siri:ServiceDelivery"]["OJPStopEventDelivery"]["StopEventResult"];
        //console.log(stopEventResults);

        const resultList = [];
        resultList.push({
          serviceName: "Service",
          destination: "Nach",
          plannedQuay: "Gleis/Kante",
          estimatedDeparture: "Progn. Abfahrt",
          timetabledDeparture: "Planm. Abfahrt"
        })

        for (const stopEventResult of stopEventResults) {
          const result = {}
          const stopEvent = stopEventResult["StopEvent"];
          result.destination = stopEvent["Service"]["DestinationText"]["Text"];
          result.serviceName = stopEvent["Service"]["PublishedServiceName"]["Text"];
          const estimatedDeparture = stopEvent["ThisCall"]["CallAtStop"]["ServiceDeparture"]["EstimatedTime"];
          result.timetabledDeparture = getTimeAsString(new Date(stopEvent["ThisCall"]["CallAtStop"]["ServiceDeparture"]["TimetabledTime"]));

          if (estimatedDeparture == null) {
            result.estimatedDeparture = result.timetabledDeparture;
          } else {
            result.estimatedDeparture = getTimeAsString(new Date(estimatedDeparture));
          }

          try {
            result.plannedQuay = stopEvent["ThisCall"]["CallAtStop"]["PlannedQuay"]["Text"];
          } catch (e) {
            result.plannedQuay = '';
          }
          resultList.push(result);

        }
        return resultList;

      });

  //console.log(parsedResults);

  const resultContainer = document.getElementById("resultContainer");

  const nodes = [];
  for (const result of parsedResults) {
    const tempResult = {train: result};
    nodes.push(h(DepartureTrain, tempResult));
  }

  const rootVNode = h('div', {}, nodes);
  render(rootVNode, resultContainer);
}


function getTimeAsString(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
</script>

<style scoped>

</style>