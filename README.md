# Fahrplan

English version below.

## Deutsche Version

Hier findest du eine Web-basierte Fahrplan-App für die Schweiz.

### Funktionen:

- Ankunft- und Abfahrtsanzeiger (Macht 2 Anfragen mit dem API-Key)
- Fahrplan mit maximal einem Via (Macht eine 1 Anfrage mit dem API-Key)

### Erste Schritte

Diese App nutzt die OJP 2.0 API von [opentransportdata.swiss](https://opentransportdata.swiss).  
Es wird ein API-Key für die OJP-API benötigt.

1. Gehe zum [opentransportdata.swiss API-Manager](https://api-manager.opentransportdata.swiss/)
2. Logge dich mit deinem Account ein oder erstelle einen neuen
3. Scrolle nach unten und klicke auf "Read more" im OJP 2.0 Kasten
4. Scrolle nach unten und klicke auf "Access with this plan". **Beachte dabei die maximale Anzahl an Anfragen, die du einhalten solltest.**
5. Erstelle eine neue App oder füge ihn zu einer bestehenden App hinzu.
6. Nun sollte eine Anfrage für diesen Plan abgeschickt worden sein. Klicke auf "Go to my Apps"
7. Klicke auf die App zu der du den OJP 2.0 Plan hinzugefügt hast
8. Im Token-Feld findest du deinen API-Key
9. Benutze dien API-Key auf [mfpl.ch](https://mfpl.ch/)

Du kannst den API-Key im Browser als Passwort speichern. Dann sollte sich das API-Key Feld automatisch ausfüllen.  
Viel Spass

**Gib deinen API-Key niemals weiter!**

## English version

This is a web based application for the swiss public transport network.

Note: The whole app is only available in german.

### Functions:

- Arrival- and Departure-Display (sends 2 request with your API-Key)
- Routing service (max. 1 via) (sends 1 request with your API-Key)

### Getting started

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
9. Use the API-Key on [mfpl.ch](https://mfpl.ch/)

**Don't share your API-Key with anyone!**  
You can save the API-Key as password and your browser should automatically fill out the API-Key field.

Have fun

## Report issue

Please report any issues on the [GitHub-Issue Page](https://github.com/Malbun/Fahrplan/issues).
