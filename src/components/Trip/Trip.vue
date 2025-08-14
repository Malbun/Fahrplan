<script setup>
import {useResultCountStore} from "@/stores/ResultCountStore.js";
import {useTripStation1Store} from "@/stores/TripStationStore1.js";
import {useTripStation2Store} from "@/stores/TripStationStore2.js";
import Station from "@/components/Station.vue";
import {getStationDetails} from "@/utils/StationUtils.js";
import {useDateStore} from "@/stores/DateStore.js";
import {inputStringToDate} from "@/utils/DateUtils.js";
import {useApikeyStore} from "@/stores/ApikeyStore.js";
import {XMLParser} from "fast-xml-parser";

const resultCountStore = useResultCountStore();
const tripStation1Store = useTripStation1Store();
const tripStation2Store = useTripStation2Store();
const dateStore = useDateStore();
const apikeyStore = useApikeyStore();

resultCountStore.set(15);

async function run() {
  const originDidokResult = await getStationDetails(tripStation1Store.tripStation1);
  const destinationDidokResult = await getStationDetails(tripStation2Store.tripStation2);

  const currentDate = new Date();

  const payload = `
      <OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" version="2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.vdv.de/ojp">
          <OJPRequest>
              <siri:ServiceRequest>
                  <siri:RequestTimestamp>${currentDate.toISOString()}</siri:RequestTimestamp>
                  <siri:RequestorRef>MalbunFahrplanUser</siri:RequestorRef>
                  <OJPTripRequest>
                      <siri:RequestTimestamp>${currentDate.toISOString()}</siri:RequestTimestamp>
                      <siri:MessageIdentifier>MalbunFahrplan</siri:MessageIdentifier>
                      <Origin>
                          <PlaceRef>
                              <siri:StopPointRef>${originDidokResult.didok}</siri:StopPointRef>
                              <Name>
                                  <Text>${originDidokResult.stationName}</Text>
                              </Name>
                          </PlaceRef>
                          <DepArrTime>${inputStringToDate(dateStore.date).toISOString()}</DepArrTime>
                      </Origin>
                      <Destination>
                          <PlaceRef>
                              <siri:StopPointRef>${destinationDidokResult.didok}</siri:StopPointRef>
                              <Name>
                                  <Text>${destinationDidokResult.stationName}</Text>
                              </Name>
                          </PlaceRef>
                      </Destination>
                      <Params>
                          <NumberOfResults>${Math.floor(resultCountStore.resultCount)}</NumberOfResults>
                          <IncludeIntermediateStops>true</IncludeIntermediateStops>
                      </Params>
                  </OJPTripRequest>
              </siri:ServiceRequest>
          </OJPRequest>
      </OJP>`;

  const parsedResults = await fetch("https://api.opentransportdata.swiss/ojp20", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/xml",
      "Authorization": "Bearer " + apikeyStore.apikey,
    }
  })
      .then(res => res.text())
      .then(xml => {
        const parser = new XMLParser();
        return parser.parse(xml);
      })
      .then(jsObject => {
        return jsObject["OJP"]["OJPResponse"]["siri:ServiceDelivery"]["OJPTripDelivery"]["TripResult"];
      });

  //console.log(parsedResults);

  for (const result of parsedResults) {
    const trip = result["Trip"];
    processTrip(trip);

  }

}

function processTrip(trip) {
  const legs = [];
  const leg = trip["Leg"];
  if (Object.hasOwn(leg, "Id")) {
    const processedLeg = processTimedLeg(leg["TimedLeg"]);
    console.log(processedLeg);
  }

  //console.log(trip);

}

function processTimedLeg(timedLeg) {
  //console.log(timedLeg);
  const leg = {};
  leg.type = "timed";

  const legBoard = timedLeg["LegBoard"];
  const legAlight = timedLeg["LegAlight"];
  const service = timedLeg["Service"];

  leg.origin = legBoard["StopPointName"]["Text"];
  leg.destination = legAlight["StopPointName"]["Text"];
  leg.trainNumber = service["TrainNumber"];
  leg.serviceName = service["PublishedServiceName"]["Text"];

  if (Object.hasOwn(legBoard["ServiceDeparture"], "EstimatedTime")) {
    leg.startTime = legBoard["ServiceDeparture"]["EstimatedTime"];
  } else {
    leg.startTime = legBoard["ServiceDeparture"]["TimetabledTime"];
  }

  if (Object.hasOwn(legAlight["ServiceArrival"], "EstimatedTime")) {
    leg.endTime = legAlight["ServiceArrival"]["EstimatedTime"];
  } else {
    leg.endTime = legAlight["ServiceArrival"]["TimetabledTime"];
  }

  const startTimeDate = new Date(leg.startTime);
  const endTimeDate = new Date(leg.endTime);
  leg.duration = Math.round((endTimeDate.getTime() - startTimeDate.getTime()) / 1000 / 60);

  const rawCalls = [];
  rawCalls.push(legBoard);

  if (Object.hasOwn(timedLeg, "LegIntermediate")) {
    const legIntermediate = timedLeg["LegIntermediate"];

    if (Object.hasOwn(legIntermediate, "Order")) {
      rawCalls.push(legIntermediate);
    } else {
      for (const intermediate of legIntermediate) rawCalls.push(intermediate);
    }
  }

  rawCalls.push(legAlight);

  //console.log(rawCalls);

  const calls = [];
  for (const stop of rawCalls) { // iterate over each stop in the leg
    const call = {};

    call.order= stop["Order"];
    call.name = stop["StopPointName"]["Text"];

    if (Object.hasOwn(stop, "ServiceDeparture")) {
      const serviceDeparture = stop["ServiceDeparture"];

      call.timetabledDeparture = serviceDeparture["TimetabledTime"];

      if (Object.hasOwn(serviceDeparture, "EstimatedTime")) {
        call.estimatedDeparture = serviceDeparture["EstimatedTime"];
      } else {
        call.estimatedDeparture = serviceDeparture["TimetabledTime"];
      }
    }

    if (Object.hasOwn(stop, "ServiceArrival")) {
      const serviceArrival = stop["ServiceArrival"];

      call.timetabledArrival = serviceArrival["TimetabledTime"];

      if (Object.hasOwn(serviceArrival, "EstimatedTime")) {
        call.estimatedArrival = serviceArrival["EstimatedTime"];
      } else {
        call.estimatedArrival = serviceArrival["TimetabledTime"];
      }
    }

    if (Object.hasOwn(stop, "EstimatedQuay")) {
      if (!(stop["PlannedQuay"]["Text"] === stop["EstimatedQuay"]["Text"])) {
        call.quay = `${stop["PlannedQuay"]["Text"]}$!${stop["EstimatedQuay"]["Text"]}`;
        }
    } else {
      if (Object.hasOwn(stop, "PlannedQuay")) {
        call.quay = String(stop["PlannedQuay"]["Text"]);
      } else {
        call.quay = "";
      }
    }

    calls.push(call);

  }

  leg.calls = calls;

  return leg;

}

</script>

<template>
  <div class="m-3">
    <div class="flex flex-wrap items-center flex-row justify-between bg-blue-300  rounded-2xl p-3">
      <div class="space-x-3 flex flex-wrap m-0.5">
        <Station :store="tripStation1Store" title="Von:" id="tripOriginStationField"/>
      </div>
      <div class="space-x-3 flex flex-wrap m-0.5">
        <Station :store="tripStation2Store" title="Nach:" id="tripDestinationStationField"/>
      </div>
      <div class="m-0.5">
        <label for="resultCountArrDep">Ergebnisse: </label>
        <input type="number" placeholder="Anzahl" id="resultCountArrDep"
               class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
               v-model="resultCountStore.resultCount"/>
      </div>
    </div>
    <div class="text-gray-100 mt-2">
      <button @click="run" class="bg-blue-300 text-black p-1.5 rounded-xl cursor-pointer hover:bg-gray-900 hover:text-white duration-300">Suchen</button>
    </div>
  </div>
</template>

<style scoped>

</style>