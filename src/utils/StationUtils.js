export const getStationDetails = async (station) => {
    const didokRequestURL = `https://data.sbb.ch/api/explore/v2.1/catalog/datasets/dienststellen-gemass-opentransportdataswiss/records?select=designationofficial, number&limit=20&refine=designationofficial:${station}`
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

    return didokResult;
}