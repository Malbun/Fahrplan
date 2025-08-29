# Fahrplan

This is a web based application for the swiss public transport network.  
Functions:

- Arrival Display
- Departure Display
- Basic routing service

## Getting started

Note: The whole application is only in german!

This application uses the OJP 2.0 API from [opentransportdata.swiss](https://opentransportdata.swiss).  
You need an API-Key for the OJP API.

1. Go to [opentransportdata.swiss API-Manager](https://api-manager.opentransportdata.swiss/)
2. Log-in with an existing account or register a new one
3. Scroll down and click on "Read more" at the OJP 2.0 box
4. Scroll down and click on "Access with this plan" (Quota: 20000 calls/day Rate: 50 calls/1 minute) This is the free plan. **Ensure that you do not make more requests than this limit.**
5. Create a new app or add it to an existing app
6. Your request should be sent. Click on "Go to my Apps"
7. Click on the app you just created
8. Get your API-Key at the token field
9. Use the API-Key on [malbun.github.io/Fahrplan](https://malbun.github.io/Fahrplan)

You can save the API-Key as password and your browser should automatically fill out the API-Key field.

Have fun

## Report issue

Please report any issues on the [GitHub-Issue Page](https://github.com/Malbun/Fahrplan/issues).
