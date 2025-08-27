// converts the duration string from a trip or leg to the amount of minutes
export const getDurationFromString = (duration: string): number => {
  let minutes: number = 0; // init the total minutes variable

  let current: string = duration.replace("PT", ""); // remove the PT letters from the string
  if (current.includes("H")) {
    // check if the string has a H for hours
    const splitByH: string[] = current.split("H"); // split the string by H
    current = splitByH[1]; // set the current working string to the rest of the split string
    minutes = minutes + Number.parseInt(splitByH[0]) * 60; // increase the total minutes
  }

  if (current.includes("M")) {
    // check if the string has an M for minutes
    const splitByM: string[] = current.split("M"); // split the string by M
    current = splitByM[1]; // set the current working string to the rest of the split string
    minutes = minutes + Number.parseInt(splitByM[0]); // increase the total minutes
  }

  if (current.includes("S")) {
    // check if the string has an S for seconds
    const splitByS: string[] = current.split("S"); // split the string by S
    if (parseInt(splitByS[0]) >= 30) {
      // check if the seconds have to be round up or down
      minutes++; // increase total minutes
    }
  }

  return minutes; // return the total minutes
};
