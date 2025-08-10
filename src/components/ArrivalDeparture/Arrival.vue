<template>
  <div id="root">
    <button @click="run" class="bg-blue-300 text-black p-1.5 rounded-xl cursor-pointer hover:bg-gray-900 hover:text-white duration-300">Suchen</button>
    <div class="mt-3 ml-1" id="resultContainer">
    </div>
  </div>
</template>

<script setup>
import { useApikeyStore } from "@/stores/ApikeyStore.js";
import {useStationStore} from "@/stores/StationStore.js";
import { useResultCountStore } from "@/stores/ResultCountStore.js";
import {getTimeAsString, inputStringToDate} from "@/utils/DateUtils.ts";
import { XMLParser } from "fast-xml-parser";
import ArrivalDepartureTrain from "./ArrivalDepartureTrain.vue";
import { h, render } from "vue";
import {useDateStore} from "@/stores/DateStore.js";
import {processCallAtStop} from "@/utils/ArrivalDepartureUtils.js";


const apikeyStore = useApikeyStore();
const stationStore = useStationStore();
const resultCountStore = useResultCountStore();
const dateStore = useDateStore();

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
  <OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.vdv.de/ojp" version="2.0">
    <OJPRequest>
        <siri:ServiceRequest>
            <siri:ServiceRequestContext>
                <siri:Language>de</siri:Language>
            </siri:ServiceRequestContext>
            <siri:RequestTimestamp>${currentDate.toISOString()}</siri:RequestTimestamp>
            <siri:RequestorRef>MalbunFahrplanUser</siri:RequestorRef>
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
                    <DepArrTime>${inputStringToDate(dateStore.date).toISOString()}</DepArrTime>
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
          originDestination: "Von",
          plannedQuay: "Gleis/ Kante",
          estimated: "Progn. Ankunft",
          timetabled: "Planm. Ankunft",
          calls: [],
          train: {currentStation: -1}
        })

        if (Object.hasOwn(stopEventResults, "StopEvent")) {
          resultList.push(processStopEvent(stopEventResults["StopEvent"]));
        } else {
          for (const stopEventResult of stopEventResults) {
            resultList.push(processStopEvent(stopEventResult))

          }
        }


        return resultList;

      });

  //console.log(parsedResults);

  const resultContainer = document.getElementById("resultContainer");

  const nodes = [];
  let currentId = 0;
  for (const result of parsedResults) {
    const tempResult = {train: result, id: currentId, arrival: true};
    nodes.push(h(ArrivalDepartureTrain, tempResult));
    currentId++;
  }

  const rootVNode = h('div', {}, nodes);
  render(rootVNode, resultContainer);
}

function processStopEvent(stopEventPassed) {
  let stopEvent;
  if (Object.hasOwn(stopEventPassed, "StopEvent")) {
    stopEvent = stopEventPassed["StopEvent"];
  } else {
    stopEvent = stopEventPassed;
  }

  const result = {}

  result.originDestination = stopEvent["Service"]["DestinationText"]["Text"];
  result.serviceName = stopEvent["Service"]["PublishedServiceName"]["Text"];
  result.currentStation = stopEvent["ThisCall"]["CallAtStop"]["Order"];
  const estimated = stopEvent["ThisCall"]["CallAtStop"]["ServiceArrival"]["EstimatedTime"];
  result.timetabled = getTimeAsString(new Date(stopEvent["ThisCall"]["CallAtStop"]["ServiceArrival"]["TimetabledTime"]), false);

  if (estimated == null) {
    result.estimated = result.timetabled;
  } else {
    result.estimated = getTimeAsString(new Date(estimated), true);
  }

  if (Object.hasOwn(stopEvent["ThisCall"]["CallAtStop"], "PlannedQuay")) {
    result.plannedQuay = String(stopEvent["ThisCall"]["CallAtStop"]["PlannedQuay"]["Text"]);
  } else {
    result.plannedQuay = "";
  }

  if (Object.hasOwn(stopEvent["ThisCall"]["CallAtStop"], "EstimatedQuay")) {
    result.plannedQuay = String(result.plannedQuay) + "$!" + stopEvent["ThisCall"]["CallAtStop"]["EstimatedQuay"]["Text"];
  }

  const previousCall = stopEvent["PreviousCall"];
  if (Object.hasOwn(previousCall, "CallAtStop")) {
    result.originDestination = previousCall["CallAtStop"]["StopPointName"]["Text"];
  }
  else {
    for (const callAtStop of previousCall) {
      if (callAtStop["CallAtStop"]["Order"] === 1) {
        result.originDestination = callAtStop["CallAtStop"]["StopPointName"]["Text"];
        break;
      }
    }
  }

  const calls = [];
  if (Object.hasOwn(stopEvent, "PreviousCall")) {
    if (Object.hasOwn(stopEvent["PreviousCall"], "CallAtStop")) {
      const callAtStop = stopEvent["PreviousCall"]["CallAtStop"];
      calls.push(processCallAtStop(callAtStop));

    } else {
      for (const iCall of stopEvent["PreviousCall"]) {
        calls.push(processCallAtStop(iCall));
      }
    }
  }

  calls.push(processCallAtStop(stopEvent["ThisCall"]))

  if (Object.hasOwn(stopEvent, "OnwardCall")) {
    if (Object.hasOwn(stopEvent["OnwardCall"], "CallAtStop")) {
      const callAtStop = stopEvent["OnwardCall"]["CallAtStop"];
      calls.push(processCallAtStop(callAtStop));

    } else {
      for (const iCall of stopEvent["OnwardCall"]) {
        calls.push(processCallAtStop(iCall));
      }
    }
  }

  result.calls = calls;

  return result;
}
</script>

<style scoped>

</style>