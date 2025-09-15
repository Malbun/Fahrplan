import { getAverageTime, inputStringToDate } from "./DateUtils";
import { XMLParser } from "fast-xml-parser";
import { getStationDetails } from "./StationUtils.js";
import { useApikeyStore } from "@/stores/ApikeyStore.js";

// This function fetches and process all data for the arrival & departure feature.
export const processArrivalDeparture = async (
  station,
  requestDateTime,
  resultCount,
) => {
  const apikeyStore = useApikeyStore(); // init apikeyStore
  const now = new Date(); // get the current time

  const apiRequestTime = new Date(
    inputStringToDate(requestDateTime) - 20 * 60000,
  );

  const didokData = await getStationDetails(station); // get the didok data for the selected station
  // create the payload for the arrival request.
  const arrivalPayload = `
  <OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="http://www.vdv.de/ojp" version="2.0">
    <OJPRequest>
      <siri:ServiceRequest>
        <siri:ServiceRequestContext>
          <siri:Language>de</siri:Language>
        </siri:ServiceRequestContext>
        <siri:RequestTimestamp>${now.toISOString()}</siri:RequestTimestamp>
        <siri:RequestorRef>MalbunFahrplanUser</siri:RequestorRef>
        <OJPStopEventRequest>
          <siri:RequestTimestamp>${now.toISOString()}</siri:RequestTimestamp>
          <siri:MessageIdentifier>MalbunFahrplan</siri:MessageIdentifier>
          <Location>
            <PlaceRef>
              <siri:StopPointRef>${didokData.didok}</siri:StopPointRef>
              <Name>
                  <Text>${didokData.stationName}</Text>
              </Name>
            </PlaceRef>
            <DepArrTime>${apiRequestTime.toISOString()}</DepArrTime>
          </Location>
          <Params>
            <NumberOfResults>${Math.abs(Math.floor(resultCount)) + 30}</NumberOfResults>
            <StopEventType>arrival</StopEventType>
            <IncludePreviousCalls>true</IncludePreviousCalls>
            <IncludeOnwardCalls>false</IncludeOnwardCalls>
            <UseRealtimeData>full</UseRealtimeData>
            <IncludeOperatingDays>false</IncludeOperatingDays>
          </Params>
        </OJPStopEventRequest>
      </siri:ServiceRequest>
    </OJPRequest>
  </OJP>
  `;

  // call the OJP api for the arrival request
  const arrivalResult = await fetch(
    "https://api.opentransportdata.swiss/ojp20",
    {
      method: "POST", // set HTTP-Method to POST
      headers: {
        "Content-Type": "application/xml", // set the content type header dor XML
        Authorization: "Bearer " + apikeyStore.apikey, // set the auth header with the bearer token
      },
      body: arrivalPayload, // set the payload as body
    },
  )
    .then((res) => res.text()) // get the body from the response as text
    .then((text) => {
      const parser = new XMLParser(); // init the XML-Parser
      return parser.parse(text); // parse the XML from the response to a JS-Object
    })
    .then(
      (xml) =>
        xml["OJP"]["OJPResponse"]["siri:ServiceDelivery"][
          "OJPStopEventDelivery"
        ],
    ); // get the main part from the parsed JS-Object

  // create the payload for the departure request.
  const departurePayload = `
  <OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="http://www.vdv.de/ojp" version="2.0">
    <OJPRequest>
      <siri:ServiceRequest>
        <siri:ServiceRequestContext>
          <siri:Language>de</siri:Language>
        </siri:ServiceRequestContext>
        <siri:RequestTimestamp>${now.toISOString()}</siri:RequestTimestamp>
        <siri:RequestorRef>MalbunFahrplanUser</siri:RequestorRef>
        <OJPStopEventRequest>
          <siri:RequestTimestamp>${now.toISOString()}</siri:RequestTimestamp>
          <siri:MessageIdentifier>MalbunFahrplan</siri:MessageIdentifier>
          <Location>
            <PlaceRef>
              <siri:StopPointRef>${didokData.didok}</siri:StopPointRef>
              <Name>
                  <Text>${didokData.stationName}</Text>
              </Name>
            </PlaceRef>
            <DepArrTime>${inputStringToDate(apiRequestTime).toISOString()}</DepArrTime>
          </Location>
          <Params>
            <NumberOfResults>${Math.abs(Math.floor(resultCount)) + 50}</NumberOfResults>
            <StopEventType>departure</StopEventType>
            <IncludePreviousCalls>false</IncludePreviousCalls>
            <IncludeOnwardCalls>true</IncludeOnwardCalls>
            <UseRealtimeData>full</UseRealtimeData>
            <IncludeOperatingDays>false</IncludeOperatingDays>
          </Params>
        </OJPStopEventRequest>
      </siri:ServiceRequest>
    </OJPRequest>
  </OJP>
  `;

  // call the OJP api
  const departureResult = await fetch(
    "https://api.opentransportdata.swiss/ojp20",
    {
      method: "POST", // set HTTP-Method to POST
      headers: {
        "Content-Type": "application/xml", // set the content type header dor XML
        Authorization: "Bearer " + apikeyStore.apikey, // set the auth header with the bearer token
      },
      body: departurePayload, // set the payload as body
    },
  )
    .then((res) => res.text()) // get the body from the response as text
    .then((text) => {
      const parser = new XMLParser(); // init the XML-Parser
      return parser.parse(text); // parse the XML from the response to a JS-Object
    })
    .then(
      (xml) =>
        xml["OJP"]["OJPResponse"]["siri:ServiceDelivery"][
          "OJPStopEventDelivery"
        ],
    ); // get the main part from the parsed JS-Object

  let parsedArrivalResults = []; // init array for the parsed arrival results
  let parsedDepartureResults = []; // init array for the parsed departure results

  const arrivalStopEventResult = arrivalResult["StopEventResult"]; // get the arrival stop results

  const unparsedArrivalStopEvents = []; // init array for the unparsed arrival stop events

  // check if the arrivalStopEvent has only one object
  if (Object.hasOwn(arrivalStopEventResult, "StopEvent")) {
    unparsedArrivalStopEvents.push(arrivalStopEventResult["StopEvent"]); // add the object to the unparsed arrival stop events array
  } else {
    // loop over each stop event of arrival stop event result
    for (const stopEvent of arrivalStopEventResult) {
      unparsedArrivalStopEvents.push(stopEvent); // add every object to the unparsed arrival stop events array
    }
  }

  // loop over each object of the unparsed arrival stop events array
  for (const event of unparsedArrivalStopEvents) {
    const parsedResult = {}; // init result object
    const stopEvent = event["StopEvent"]; // get the stop event

    const service = stopEvent["Service"]; // get the service object
    const previousCall = stopEvent["PreviousCall"]; // get the previous call object
    const thisCall = stopEvent["ThisCall"]["CallAtStop"]; // get the thisCall object

    parsedResult.origin = service["OriginText"]["Text"]; // set the origin in the result object to the origin text of the service object
    parsedResult.destination = service["DestinationText"]["Text"]; // set the destination in the result object to the destination text of the service object
    parsedResult.trainNumber = service["TrainNumber"]; // set the trainNumber in the result object to the trainNumber text of the service object
    parsedResult.serviceName = service["PublishedServiceName"]["Text"]; // set the serviceName in the result object to the publishedServiceName text of the service object
    parsedResult.modeName = service["Mode"]["Name"]["Text"]; // set the modeName in the result object to the name of the transportation mode of the service object

    let plannedQuay = ""; // init plannedQuay variable
    let estimatedQuay = ""; // init plannedQuay variable

    // check if a planned Quay object exists on thisCall object
    if (Object.hasOwn(thisCall, "PlannedQuay")) {
      plannedQuay = String(thisCall["PlannedQuay"]["Text"]); // get the planned quay from thisCall object
      // check if an estimatedQuay object exists on the thisCall object
      if (Object.hasOwn(thisCall, "EstimatedQuay")) {
        estimatedQuay = thisCall["EstimatedQuay"]["Text"]; // get the estimated quay from thisCall object
      } else {
        estimatedQuay = plannedQuay; // set estimatedQuay to plannedQuay if no estimatedQuay object exists
      }
    }

    const timetabledArrival = thisCall["ServiceArrival"]["TimetabledTime"]; // get the timetabled arrival from thisCall object
    let estimatedArrival = timetabledArrival; // set the estimated arrival to timetabled arrival

    // check if an estimated time object exists
    if (Object.hasOwn(thisCall["ServiceArrival"], "EstimatedTime")) {
      estimatedArrival = thisCall["ServiceArrival"]["EstimatedTime"]; // override the estimated arrival time eith the estimated time
    }

    const stationName = thisCall["StopPointName"]["Text"]; // get the station name from thisCall

    // set the fetched values to the result object
    parsedResult.thisCall = {
      stationName: stationName,
      plannedQuay: plannedQuay,
      estimatedQuay: estimatedQuay,
      timetabledArrival: timetabledArrival,
      estimatedArrival: estimatedArrival,
    };

    const previousCallUnparsed = []; // init an array for the unparsed previous calls
    const previousCallParsed = []; // init an array for the parsed previous calls

    // check if the previous call has only one call
    if (Object.hasOwn(previousCall, "CallAtStop")) {
      previousCallUnparsed.push(previousCall["CallAtStop"]); // add the single previous call to the unparsed previous calls array
    } else {
      // iterate over all previous calls
      for (const call of previousCall) {
        previousCallUnparsed.push(call); // add every previous call to the unparsed previous calls array
      }
    }

    // iterate over the unparsed previous calls array
    for (const call of previousCallUnparsed) {
      const callParsed = processOtherCall(call); // process the previous call
      previousCallParsed.push(callParsed); // add the processed previous call to the parsed previous calls array
    }

    parsedResult.previousCall = previousCallParsed; // add the parsed previous calls to the result object
    parsedArrivalResults.push(parsedResult); // add the result object to the array with the parsed arrival results
  }

  const departureStopEventResult = departureResult["StopEventResult"]; // get the stop event result from the departure result

  const unparsedDepartureStopEvents = []; // init the array for the unparsed departure stop events

  // check if departureStopEventResult has only one item
  if (Object.hasOwn(departureStopEventResult, "StopEvent")) {
    unparsedDepartureStopEvents.push(departureStopEventResult["StopEvent"]); // add the single departure stop event to the unparsed departure stop events array
  } else {
    // iterate over departureStopEventResult
    for (const stopEvent of departureStopEventResult) {
      unparsedDepartureStopEvents.push(stopEvent); // add every stop event to the unparsed departure stop events array
    }
  }

  // iterate over every event in the unparsed departure stop events array
  for (const event of unparsedDepartureStopEvents) {
    const parsedResult = {}; // init result object
    const stopEvent = event["StopEvent"]; // get the stop event

    const service = stopEvent["Service"]; // get the service object
    const onwardCall = stopEvent["OnwardCall"]; // get the previous call object
    const thisCall = stopEvent["ThisCall"]["CallAtStop"]; // get the thisCall object

    parsedResult.origin = service["OriginText"]["Text"]; // set the origin in the result object to the origin text of the service object
    parsedResult.destination = service["DestinationText"]["Text"]; // set the destination in the result object to the destination text of the service object
    parsedResult.trainNumber = service["TrainNumber"]; // set the trainNumber in the result object to the trainNumber text of the service object
    parsedResult.serviceName = service["PublishedServiceName"]["Text"]; // set the serviceName in the result object to the publishedServiceName text of the service object
    parsedResult.modeName = service["Mode"]["Name"]["Text"]; // set the modeName in the result object to the name of the transportation mode of the service object

    let plannedQuay = ""; // init plannedQuay variable
    let estimatedQuay = ""; // init plannedQuay variable

    if (Object.hasOwn(thisCall, "PlannedQuay")) {
      plannedQuay = String(thisCall["PlannedQuay"]["Text"]); // get the planned quay from thisCall object
      // check if an estimatedQuay object exists on the thisCall object
      if (Object.hasOwn(thisCall, "EstimatedQuay")) {
        estimatedQuay = thisCall["EstimatedQuay"]["Text"]; // get the estimated quay from thisCall object
      } else {
        estimatedQuay = plannedQuay; // set estimatedQuay to plannedQuay if no estimatedQuay object exists
      }
    }

    const timetabledDeparture = thisCall["ServiceDeparture"]["TimetabledTime"]; // get the timetabled departure from the thisCall object
    let estimatedDeparture = timetabledDeparture; // set the estimated departure time to the timetabled departure time

    // check if an estimated departure time exists
    if (Object.hasOwn(thisCall["ServiceDeparture"], "EstimatedTime")) {
      estimatedDeparture = thisCall["ServiceDeparture"]["EstimatedTime"]; // override the estimated departure time
    }

    const stationName = thisCall["StopPointName"]["Text"]; // get the station name

    // add the fetched values to the result object
    parsedResult.thisCall = {
      stationName: stationName,
      plannedQuay: plannedQuay,
      estimatedQuay: estimatedQuay,
      timetabledDeparture: timetabledDeparture,
      estimatedDeparture: estimatedDeparture,
    };

    const onwardCallUnparsed = []; // init the array for the unparsed onward calls
    const onwardCallParsed = []; // init the array for the parsed onward calls

    // check if the onwardCall contains only a sigle object
    if (Object.hasOwn(onwardCall, "CallAtStop")) {
      onwardCallUnparsed.push(onwardCall["CallAtStop"]); // add the object to the unparsed onwards call array
    } else {
      // iterate over the onwardCall
      for (const call of onwardCall) {
        onwardCallUnparsed.push(call); // add every call to the unparsed onwards call array
      }
    }

    // iterate over the unparsed onwards call array
    for (const call of onwardCallUnparsed) {
      const callParsed = processOtherCall(call); // process the call
      onwardCallParsed.push(callParsed); // add the processed call to the parsed onward calls array
    }

    parsedResult.onwardCall = onwardCallParsed; // add the onward calls to the result object
    parsedDepartureResults.push(parsedResult); // add the result to the parsed departure array
  }

  let pairs = []; // init array for the pairs

  // iterate over each element of the parsed arrival results array
  for (let i = parsedArrivalResults.length - 1; i >= 0; i--) {
    const arrivalResult = parsedArrivalResults[i];
    // find index of the matching train in the parsed departure array according to the train number
    const indexAtDeparture = parsedDepartureResults.findIndex(
      (departureResult) =>
        departureResult.trainNumber === arrivalResult.trainNumber,
    );

    // checks if a matching train was found
    if (indexAtDeparture !== -1) {
      // add both elements to the pairs array
      pairs.push({
        arrival: arrivalResult,
        departure: parsedDepartureResults[indexAtDeparture],
      });

      // delete both elements from the parsed arrival/departure array
      parsedArrivalResults.splice(i, 1);
      parsedDepartureResults.splice(indexAtDeparture, 1);
    }
  }

  // map the pairs array to a new structure and filter it
  pairs = pairs
    .map((obj) => {
      return {
        hasPrevious: true, // add hasPrevious flag
        hasOnward: true, // add hasOnward flag
        origin: obj.arrival.origin,
        destination: obj.departure.destination,
        modeName: obj.departure.modeName,
        serviceName: obj.departure.serviceName,
        previousCall: obj.arrival.previousCall,
        onwardCall: obj.departure.onwardCall,
        trainNumber: obj.departure.trainNumber,
        thisCall: {
          // combine thisCall
          plannedQuay: obj.arrival.thisCall.plannedQuay,
          estimatedQuay: obj.arrival.thisCall.estimatedQuay,
          stationName: obj.arrival.thisCall.stationName,
          timetabledArrival: obj.arrival.thisCall.timetabledArrival,
          estimatedArrival: obj.arrival.thisCall.estimatedArrival,
          timetabledDeparture: obj.departure.thisCall.timetabledDeparture,
          estimatedDeparture: obj.departure.thisCall.estimatedDeparture,
          // add the midTime attribute for sorting. Calculate the average time between estimated arrival and departure
          midTime: getAverageTime(
            inputStringToDate(obj.arrival.thisCall.estimatedArrival),
            inputStringToDate(obj.departure.thisCall.estimatedDeparture),
          ).toISOString(),
        },
      };
    })
    // only let elements pass that are after the requested time
    .filter((result) => {
      return (
        inputStringToDate(requestDateTime) <=
        inputStringToDate(result.thisCall.timetabledArrival)
      );
    });

  // filter and map left over parsed arrival elements
  parsedArrivalResults = parsedArrivalResults
    // only let elements pas that are ending at the current station and are after the requested time
    .filter((result) => {
      return (
        result.destination === result.thisCall.stationName &&
        inputStringToDate(requestDateTime) <=
          inputStringToDate(result.thisCall.estimatedArrival)
      );
    })
    // add hasPrevious and hasOnward flags
    .map((result) => {
      return {
        hasPrevious: true,
        hasOnward: false,
        origin: result.origin,
        destination: result.destination,
        modeName: result.modeName,
        serviceName: result.serviceName,
        previousCall: result.previousCall,
        trainNumber: result.trainNumber,
        thisCall: result.thisCall,
      };
    });

  // filter and map left over parsed departure elements
  parsedDepartureResults = parsedDepartureResults
    // only let elements pas that are starting at the current station and are after the requested time
    .filter((result) => {
      return (
        result.origin === result.thisCall.stationName &&
        inputStringToDate(requestDateTime) <=
          inputStringToDate(result.thisCall.estimatedDeparture)
      );
    })
    // add hasPrevious and hasOnward flags
    .map((result) => {
      return {
        hasPrevious: false,
        hasOnward: true,
        origin: result.origin,
        destination: result.destination,
        modeName: result.modeName,
        serviceName: result.serviceName,
        onwardCall: result.onwardCall,
        trainNumber: result.trainNumber,
        thisCall: result.thisCall,
      };
    });

  // sort all result arrays according to the time. Starting with the smallest.
  pairs.sort(
    (a, b) =>
      inputStringToDate(a.thisCall.midTime).getTime() -
      inputStringToDate(b.thisCall.midTime).getTime(),
  );
  parsedArrivalResults.sort(
    (a, b) =>
      inputStringToDate(a.thisCall.estimatedArrival).getTime() -
      inputStringToDate(b.thisCall.estimatedArrival).getTime(),
  );
  parsedDepartureResults.sort(
    (a, b) =>
      inputStringToDate(a.thisCall.estimatedDeparture).getTime() -
      inputStringToDate(b.thisCall.estimatedDeparture).getTime(),
  );

  const finalResult = []; // init array for the final result

  console.log(parsedArrivalResults);

  // loop resultCount times
  for (let i = 0; i < resultCount; i++) {
    // get the time from the first element from every result array
    let pairsTime = inputStringToDate(pairs[0] === undefined ? "" : pairs[0].thisCall.midTime).getTime();
    const arrivalTime = inputStringToDate(parsedArrivalResults[0] === undefined ? "" : parsedArrivalResults[0].thisCall.estimatedArrival).getTime();
    const departureTime = inputStringToDate(parsedDepartureResults[0] === undefined ? "" : parsedDepartureResults[0].thisCall.estimatedDeparture).getTime();

    // check if the time is undefined, null or NaN
    if (pairsTime === undefined || pairsTime === null || isNaN(pairsTime)) {
      pairsTime = Infinity; // set the faulty time to Infinity
    }

    let smallestName = "pairs"; // init variable for the current smallest value name
    let smallestValue = pairsTime; // init variable for the current smallest value

    // check if arrival time is smaller than the current smallest value
    if (arrivalTime < smallestValue) {
      smallestName = "arrival"; // set the current smallest value name to arrival
      smallestValue = arrivalTime; // set the current smallest valuer to the value of arrival
    }

    // check if departure time is smaller than the current smallest value
    if (departureTime < smallestValue) {
      smallestName = "departure"; // set the current smallest value name to departure
    }

    // add the first element from the smallest value array to the final array.
    // remove the added element from the result array
    switch (smallestName) {
      case "pairs": {
        finalResult.push(pairs[0]);
        pairs.splice(0, 1);
        break;
      }
      case "arrival": {
        finalResult.push(parsedArrivalResults[0]);
        parsedArrivalResults.splice(0, 1);
        break;
      }
      case "departure": {
        finalResult.push(parsedDepartureResults[0]);
        parsedDepartureResults.splice(0, 1);
        break;
      }
    }
  }

  return finalResult; // return the final array
};

// process previous- and onwardCalls
function processOtherCall(call) {
  const callParsed = {}; // init the result array
  let currentCall; // init the variable for the current call

  // checks if call contains a callAtStop
  if (Object.hasOwn(call, "CallAtStop")) {
    currentCall = call["CallAtStop"]; // set currentCall to the CallAtStop object
  } else {
    currentCall = call; // set the currentCall to call
  }

  let plannedQuay = ""; // init the planned quay variable
  let estimatedQuay = ""; // init the estimated quay variable

  // check if the current call has a planned quay
  if (Object.hasOwn(currentCall, "PlannedQuay")) {
    plannedQuay = String(currentCall["PlannedQuay"]["Text"]); // get the planned quay into plannedQuay
    // check if the current call has an estimated quay
    if (Object.hasOwn(currentCall, "EstimatedQuay")) {
      estimatedQuay = currentCall["EstimatedQuay"]["Text"]; // get the estimated quay into estimatedQuay
    } else {
      estimatedQuay = plannedQuay; // set estimatedQuay to the plannedQuay if no estimated quay is defined
    }
  }

  let timetabledArrival = ""; // init variable for the timetabled arrival
  let estimatedArrival = ""; // init variable for the estimated arrival

  // check if the current call has any arrival times
  if (Object.hasOwn(currentCall, "ServiceArrival")) {
    timetabledArrival = currentCall["ServiceArrival"]["TimetabledTime"]; // get the timetabled arrival into timetabledArrival
    estimatedArrival = timetabledArrival; // set estimatedArrival to timetabledArrival

    // check if the current call has an estimated arrival time
    if (Object.hasOwn(currentCall["ServiceArrival"], "EstimatedTime")) {
      estimatedArrival = currentCall["ServiceArrival"]["EstimatedTime"]; // set the estimatedArrival to the estimated arrival time
    }
  }

  let timetabledDeparture = ""; // init variable for the timetabled departure
  let estimatedDeparture = ""; // init variable for the estimated departure

  // check if the current call has any departure times
  if (Object.hasOwn(currentCall, "ServiceDeparture")) {
    timetabledDeparture = currentCall["ServiceDeparture"]["TimetabledTime"]; // get the timetabled arrival into timetabledDeparture
    estimatedDeparture = timetabledDeparture; // set estimatedDeparture to timetabledDeparture

    // check if the current call has an estimated departure time
    if (Object.hasOwn(currentCall["ServiceDeparture"], "EstimatedTime")) {
      estimatedDeparture = currentCall["ServiceDeparture"]["EstimatedTime"]; // set the estimatedDeparture to the estimated departure time
    }
  }

  const stationName = currentCall["StopPointName"]["Text"]; // get the station name
  const order = currentCall["Order"]; // get the order  number

  // add the values to the result object
  callParsed.plannedQuay = plannedQuay;
  callParsed.estimatedQuay = estimatedQuay;
  callParsed.timetabledArrival = timetabledArrival;
  callParsed.estimatedArrival = estimatedArrival;
  callParsed.timetabledDeparture = timetabledDeparture;
  callParsed.estimatedDeparture = estimatedDeparture;
  callParsed.stationName = stationName;
  callParsed.order = order;

  return callParsed; // return the result object
}
