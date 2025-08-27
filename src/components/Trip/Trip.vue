<script setup>
  // imports
  import { useResultCountStore } from "@/stores/ResultCountStore.js";
  import { useTripStation1Store } from "@/stores/TripStationStore1.js";
  import { useTripStation2Store } from "@/stores/TripStationStore2.js";
  import Station from "@/components/Station.vue";
  import { getStationDetails } from "@/utils/StationUtils.js";
  import { useDateStore } from "@/stores/DateStore.js";
  import { inputStringToDate } from "@/utils/DateUtils.js";
  import { useApikeyStore } from "@/stores/ApikeyStore.js";
  import { XMLParser } from "fast-xml-parser";
  import { getDurationFromString } from "@/utils/TripUtils.ts";
  import { h, render } from "vue";
  import TripResultList from "@/components/Trip/TripResultList.vue";

  // stores
  const resultCountStore = useResultCountStore();
  const tripStation1Store = useTripStation1Store();
  const tripStation2Store = useTripStation2Store();
  const dateStore = useDateStore();
  const apikeyStore = useApikeyStore();

  resultCountStore.set(15); // set result counter default to 15

  async function run() {
    const originDidokResult = await getStationDetails(
      tripStation1Store.tripStation1,
    ); // get the station details for station1
    const destinationDidokResult = await getStationDetails(
      tripStation2Store.tripStation2,
    ); // get the station details for station2

    const currentDate = new Date();

    // configure the payload for the response
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

    let parsedResults = await fetch(
      "https://api.opentransportdata.swiss/ojp20",
      {
        // send request to API Endpoint
        method: "POST", // set HTTP Method
        body: payload, // add payload to request
        headers: {
          // add headers to request
          "Content-Type": "application/xml", // set Content Type to XML
          Authorization: "Bearer " + apikeyStore.apikey, // set Auth header with bearer token
        },
      },
    )
      .then((res) => res.text()) // get body as text from response
      .then((xml) => {
        const parser = new XMLParser(); // init XML Parser
        return parser.parse(xml); // parse the body text to JS Object
      })
      .then((jsObject) => {
        return jsObject["OJP"]["OJPResponse"]["siri:ServiceDelivery"][
          "OJPTripDelivery"
        ]["TripResult"]; // access the needed information
      });

    const processedTrips = []; // init array for the processed trips

    if (Object.hasOwn(parsedResults, "Trip")) {
      parsedResults = [parsedResults];
    }

    for (const result of parsedResults) {
      // iterate over each result
      const processedTrip = {}; // init object for all information about this trip

      const trip = result["Trip"]; // get the Trip out of the result
      processedTrip.id = trip["Id"]; // set id from trip id
      processedTrip.startTime = trip["StartTime"]; // set the start time from the trip
      processedTrip.endTime = trip["EndTime"]; // set the end time from the trip
      processedTrip.legs = processTrip(trip); // process the trip
      processedTrip.duration = getDurationFromString(trip["Duration"]); // set duration from trip
      processedTrips.push(processedTrip); // add processed trip to the array with the processed trips
    }

    const tripResultContainer = document.getElementById("tripResultContainer");
    const tripResultElement = h(
      TripResultList,
      { trips: processedTrips },
      null,
    );
    render(tripResultElement, tripResultContainer);
  }

  // extracts the needed information from a trip from the result
  function processTrip(trip) {
    const legs = []; // init array to store the legs
    const leg = trip["Leg"]; // access the leg object witch contains all legs

    if (Object.hasOwn(leg, "Id")) {
      // Check if trip only have one leg
      const processedLeg = processTimedLeg(leg["TimedLeg"]); // process the timedLeg
      processedLeg.duration = getDurationFromString(leg["Duration"]); // get the duration from the leg in minutes
      legs.push(processedLeg); // add the leg to the leg array
    } else {
      // has multiple legs
      for (const singleLeg of leg) {
        // iterate over each leg
        if (Object.hasOwn(singleLeg, "TimedLeg")) {
          // checks if the leg is a timed leg
          const processedLeg = processTimedLeg(singleLeg["TimedLeg"]); // process the timedLeg
          processedLeg.duration = getDurationFromString(singleLeg["Duration"]); // get the duration from the leg in minutes
          legs.push(processedLeg); // add the processed timed leg to the array with the processed legs
        } else {
          // is not timed leg -> transfer leg
          const processedLeg = processTransferLeg(singleLeg["TransferLeg"]); // process transfer leg
          processedLeg.duration = getDurationFromString(singleLeg["Duration"]); // get the duration from the leg in minutes
          legs.push(processedLeg); // add the processed transfer leg to the array with the processed legs
        }
      }
    }
    return legs; // return the processed legs
  }

  // extracts the needed information from a transfer leg
  function processTransferLeg(transferLeg) {
    const leg = {}; // init leg objects for final data

    leg.type = "transfer"; // set type to transfer
    leg.transferType = transferLeg["TransferType"]; // set the transfer type from the property TransferType
    leg.start = transferLeg["LegStart"]["Name"]["Text"]; // set the start from LegStart
    leg.end = transferLeg["LegEnd"]["Name"]["Text"]; // set the end from LegEnd

    return leg; // return the final object
  }

  // extracts the needed information from a timed leg
  function processTimedLeg(timedLeg) {
    //console.log(timedLeg);
    const leg = {}; // init the main data structure for response
    leg.type = "timed"; // set the leg type to timed

    const legBoard = timedLeg["LegBoard"]; // get the legBoard Object (origin)
    const legAlight = timedLeg["LegAlight"]; // get the  legAlight Object (destination)
    const service = timedLeg["Service"]; // get the service Object; provides additional information about the leg

    leg.origin = legBoard["StopPointName"]["Text"]; // set the origin
    leg.destination = legAlight["StopPointName"]["Text"]; // set the destination
    leg.trainNumber = service["TrainNumber"]; // set the train number
    leg.serviceName = service["PublishedServiceName"]["Text"]; // set the name of the service

    leg.trainDestination = service["DestinationText"]["Text"]; // set train destination from DestinationText

    leg.ptMode = service["Mode"]["PtMode"]; // set mode from PtMode
    leg.modeShort = service["Mode"]["ShortName"]["Text"];

    if (Object.hasOwn(legBoard["ServiceDeparture"], "EstimatedTime")) {
      // check if the legBoard has an estimated time
      leg.startTime = legBoard["ServiceDeparture"]["EstimatedTime"]; // set the start time to the estimated time
    } else {
      // has no estimated time
      leg.startTime = legBoard["ServiceDeparture"]["TimetabledTime"]; // set the start time to the timetabled time
    }

    if (Object.hasOwn(legAlight["ServiceArrival"], "EstimatedTime")) {
      // check if the legAlight has an estimated time
      leg.endTime = legAlight["ServiceArrival"]["EstimatedTime"]; // set the end time to the estimated time
    } else {
      // has no estimated time
      leg.endTime = legAlight["ServiceArrival"]["TimetabledTime"]; // set the end time to the timetabled time
    }

    const rawCalls = []; // init array for unprocessed intermediate calls
    rawCalls.push(legBoard); // add legBoard as first element

    if (Object.hasOwn(timedLeg, "LegIntermediate")) {
      // check if the leg has intermediate stops
      const legIntermediate = timedLeg["LegIntermediate"]; // access legIntermate; contains all intermediate stops

      if (Object.hasOwn(legIntermediate, "Order")) {
        // check if legIntermediate has multiple children  true -> has only one child
        rawCalls.push(legIntermediate); // push single child to rawCalls
      } else {
        // has multiple children
        for (const intermediate of legIntermediate) rawCalls.push(intermediate); // add each child to rawCalls
      }
    }

    rawCalls.push(legAlight); // add legAlight to rawCalls

    const calls = []; // init array for processed calls
    for (const stop of rawCalls) {
      // iterate over each stop in the leg
      const call = {}; // init data structure for a call

      call.order = stop["Order"]; // set order in call
      call.name = stop["StopPointName"]["Text"]; // set the name of the targeted station

      if (Object.hasOwn(stop, "ServiceDeparture")) {
        // checks if the call has a serviceDeparture (information about the departure at this stop) field
        const serviceDeparture = stop["ServiceDeparture"]; // access ServiceDeparture

        call.timetabledDeparture = serviceDeparture["TimetabledTime"]; // set timetabledDeparture in call

        if (Object.hasOwn(serviceDeparture, "EstimatedTime")) {
          // checks if serviceDeparture has an estimated time
          call.estimatedDeparture = serviceDeparture["EstimatedTime"]; // set estimatedDeparture to estimatedTime
        } else {
          // has no estimated time
          call.estimatedDeparture = serviceDeparture["TimetabledTime"]; // set the estimated time to the timetabled time
        }
      }

      if (Object.hasOwn(stop, "ServiceArrival")) {
        // checks if the call has a serviceArrival (information about the arrival at the stop) field
        const serviceArrival = stop["ServiceArrival"]; // access ServiceArrival

        call.timetabledArrival = serviceArrival["TimetabledTime"]; // set timetabledArrival in call

        if (Object.hasOwn(serviceArrival, "EstimatedTime")) {
          // checks if the serviceArrival has an estimated time
          call.estimatedArrival = serviceArrival["EstimatedTime"]; // set estimatedTime to the estimated time
        } else {
          // has no estimated time
          call.estimatedArrival = serviceArrival["TimetabledTime"]; // set estimatedTime to the timetabled time
        }
      }

      if (Object.hasOwn(stop, "EstimatedQuay")) {
        // check if the stop has an EstimatedQuay field
        if (!(stop["PlannedQuay"]["Text"] === stop["EstimatedQuay"]["Text"])) {
          // checks if the planned quay is not equal to the estimated quay
          call.quay = `${stop["PlannedQuay"]["Text"]}$!${stop["EstimatedQuay"]["Text"]}`; // set quay to '(plannedQuay)$!(estimatedQuay)'
        } else {
          // has estimated quay and timetabled quay, but they are the same
          call.quay = String(stop["EstimatedQuay"]["Text"]); // set quay to estimated quay
        }
      } else {
        // has no estimated quay
        if (Object.hasOwn(stop, "PlannedQuay")) {
          // checks if the stop has a planned quay field
          call.quay = String(stop["PlannedQuay"]["Text"]); // set quay to the planned quay
        } else {
          // has no planned quay
          call.quay = ""; // set quay to an empty string
        }
      }

      calls.push(call); // add current call to the array of processed calls
    }

    leg.calls = calls; // set calls to the array of processed calls

    return leg; // returns the processed leg
  }
</script>

<template>
  <div class="m-3">
    <div
      class="flex flex-wrap items-center flex-row justify-between bg-blue-300 rounded-2xl p-3"
    >
      <div class="space-x-3 flex flex-wrap m-0.5">
        <Station
          id="tripOriginStationField"
          :store="tripStation1Store"
          title="Von:"
        />
      </div>
      <div class="space-x-3 flex flex-wrap m-0.5">
        <Station
          id="tripDestinationStationField"
          :store="tripStation2Store"
          title="Nach:"
        />
      </div>
      <div class="m-0.5">
        <label for="resultCountArrDep">Ergebnisse:</label>
        <input
          id="resultCountArrDep"
          v-model="resultCountStore.resultCount"
          type="number"
          placeholder="Anzahl"
          class="p-2 rounded-2xl hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 outline-0"
        />
      </div>
    </div>
    <div class="text-gray-100 mt-2">
      <button
        class="bg-blue-300 text-black p-1.5 rounded-xl cursor-pointer hover:bg-gray-900 hover:text-white duration-300"
        @click="run"
      >
        Suchen
      </button>
      <div id="tripResultContainer"></div>
    </div>
  </div>
</template>

<style scoped></style>
