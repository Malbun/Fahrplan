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
import { getTimeAsString } from "@/utils/DateUtils.ts";
import { XMLParser } from "fast-xml-parser";
import ArrivalTrain from "./ArrivalTrain.vue";
import { h, render } from "vue";


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
                    <StopEventType>arrival</StopEventType>
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
          serviceName: "Linie",
          origin: "Von",
          plannedQuay: "Gleis/Kante",
          estimatedArrival: "Progn. Ankunft",
          timetabledArrival: "Planm. Ankunft"
        })

        for (const stopEventResult of stopEventResults) {
          const result = {}
          const stopEvent = stopEventResult["StopEvent"];
          result.destination = stopEvent["Service"]["DestinationText"]["Text"];
          result.serviceName = stopEvent["Service"]["PublishedServiceName"]["Text"];
          const estimatedArrival = stopEvent["ThisCall"]["CallAtStop"]["ServiceArrival"]["EstimatedTime"];
          result.timetabledArrival = getTimeAsString(new Date(stopEvent["ThisCall"]["CallAtStop"]["ServiceArrival"]["TimetabledTime"]), false);

          if (estimatedArrival == null) {
            result.estimatedArrival = result.timetabledArrival;
          } else {
            result.estimatedArrival = getTimeAsString(new Date(estimatedArrival), true);
          }

          try {
            result.plannedQuay = stopEvent["ThisCall"]["CallAtStop"]["PlannedQuay"]["Text"];
          } catch (e) {
            result.plannedQuay = '';
          }

          const previousCall = stopEvent["PreviousCall"];
          if (Object.hasOwn(previousCall, "CallAtStop")) {
            result.origin = previousCall["CallAtStop"]["StopPointName"]["Text"];
          }
          else {
            for (const callAtStop of previousCall) {
              if (callAtStop["CallAtStop"]["Order"] === 1) {
                result.origin = callAtStop["CallAtStop"]["StopPointName"]["Text"];
                break;
              }
            }
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
    nodes.push(h(ArrivalTrain, tempResult));
  }

  const rootVNode = h('div', {}, nodes);
  render(rootVNode, resultContainer);
}
</script>

<style scoped>

</style>