import json
import requests

data = None
newData = []

print("Start fetching data...")

response = requests.get("https://data.sbb.ch/api/explore/v2.1/catalog/datasets/dienststellen-gemass-opentransportdataswiss/exports/json")
if response.status_code == 200:
    print("Data fetched")
    
    print("Start processing data...")
    data = response.json()

else:
    raise IOError("Get bad response code from api: " + str(response.status_code))

print("Processing data...")
for item in data:
    if item["meansoftransport"] is not None and item["meansoftransport"] != "UNKNOWN":
        abbreviation = item["abbreviation"]
        designationofficial = item["designationofficial"]
        itemData = {
            "a": abbreviation,
            "l": designationofficial
        }
        newData.append(itemData)

print("Finished processing data")

print("Start saving processed data...")
outputFile = open("src/data/stationData.json", "w")
outputFile.write(json.dumps(newData))
outputFile.close()

print("Finished saving processed data")
print("Job completed")
