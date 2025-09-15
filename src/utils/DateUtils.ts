export const getTimeAsString = (date: Date, seconds: boolean): string => {
  const hh: string = String(date.getHours()).padStart(2, "0");
  const mm: string = String(date.getMinutes()).padStart(2, "0");
  const ss: string = String(date.getSeconds()).padStart(2, "0");
  if (isNaN(date.getHours())) {
    return "";
  }
  if (seconds) {
    return `${hh}:${mm}:${ss}`;
  } else {
    return `${hh}:${mm}`;
  }
};

export const getDateAsString = (date: Date): string => {
  const yyyy: string = String(date.getFullYear()).padStart(2, "0");
  const mm: string = String(date.getMonth() + 1).padStart(2, "0");
  const dd: string = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const inputStringToDate = (input): Date => {
  return new Date(input);
};

// checks if the train is delayed with two times
export const isDelayed = (time1: string, time2: string): boolean => {
  const time1Date: Date = new Date(time1); // covert time1 to date
  const time2Date: Date = new Date(time2); // convert time2 start time to date
  const diffTime = Math.abs(time1Date.getTime() - time2Date.getTime()); // calculate difference between the dates
  const diffMinutes = Math.floor(diffTime / (1000 * 60)); // convert difference from milliseconds to minutes

  return diffMinutes >= 3; // return true if the difference is greater or equal to 3 minutes
};

// converts time string to a date string
export const timeToDateString = (time: string): string => {
  return `2025-01-01T${time}Z`; // returns the processed string
};

export const getAverageTime = (d1: Date, d2: Date): Date => {
  const d1millis: number = d1.getTime();
  const d2millis: number = d2.getTime();
  const averageTime: number = Math.round((d1millis + d2millis) / 2);
  return new Date(averageTime);
};
