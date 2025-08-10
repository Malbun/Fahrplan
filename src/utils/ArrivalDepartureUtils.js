export const processCallAtStop = (callAtStopPassed) => {
  let callAtStop;
  if (Object.hasOwn(callAtStopPassed, "CallAtStop")) {
    callAtStop = callAtStopPassed["CallAtStop"];
  } else {
    callAtStop = callAtStopPassed;
  }
  const singleCall = {};

  //console.log(callAtStop);

  singleCall.order = callAtStop["Order"];
  singleCall.name = callAtStop["StopPointName"]["Text"];

  if (Object.hasOwn(callAtStop, "ServiceDeparture")) {
    singleCall.timetabledDeparture = callAtStop["ServiceDeparture"]["TimetabledTime"];

    if (Object.hasOwn(callAtStop["ServiceDeparture"], "EstimatedTime")) {
      singleCall.estimatedDeparture = callAtStop["ServiceDeparture"]["EstimatedTime"];
    } else singleCall.estimatedDeparture = singleCall.timetabledDeparture;

  } else {
    singleCall.estimatedDeparture = "";
    singleCall.timetabledDeparture = "";
  }

  if (Object.hasOwn(callAtStop, "ServiceArrival")) {
    singleCall.timetabledArrival = callAtStop["ServiceArrival"]["TimetabledTime"];

    if (Object.hasOwn(callAtStop["ServiceArrival"], "EstimatedTime")) {
      singleCall.estimatedArrival = callAtStop["ServiceArrival"]["EstimatedTime"];
    } else singleCall.estimatedArrival = singleCall.timetabledArrival;
  } else {
    singleCall.estimatedArrival = "";
    singleCall.timetabledArrival = "";
  }

  if (Object.hasOwn(callAtStop, "PlannedQuay")) {
    singleCall.plannedQuay = String(callAtStop["PlannedQuay"]["Text"]);
  } else {
    singleCall.plannedQuay = "";
  }

  if (Object.hasOwn(callAtStop, "EstimatedQuay")) {
    singleCall.plannedQuay = String(singleCall.plannedQuay) + "$!" + callAtStop["EstimatedQuay"]["Text"];
  }

  return singleCall;

}