import json
import requests

data = None
newData = []

response = requests.get("https://data.sbb.ch/api/explore/v2.1/catalog/datasets/dienststellen-gemass-opentransportdataswiss/exports/json")
if response.status_code == 200:
    data = response.json()

else:
    raise IOError("Get bad response code from api: " + str(response.status_code))

for item in data:
    if item["meansoftransport"] is not None and item["meansoftransport"] != "UNKNOWN":
        abbreviation = item["abbreviation"]
        designationofficial = item["designationofficial"]
        itemData = {
            "a": abbreviation,
            "l": designationofficial
        }
        newData.append(itemData)

outputFile = open("src/data/stationData.json", "w")
outputFile.write(json.dumps(newData))
outputFile.close()


