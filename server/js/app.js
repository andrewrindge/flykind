const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

// Running locally in development, so need to bypass corrs
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// To allow POST requests
const multer = require("multer");

// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true})); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

// API access
var Amadeus = require('amadeus');
var amadeus = new Amadeus({
  clientId: 'WABRJuydfMKFJp5ocr7ew9K5VFdusIjE',
  clientSecret: 'Km6UQ7AkZBIeihpu'
});

// listening on...
const port = 8000;

// Error message constants
const USER_ERROR = 400;
const PARAMS_ERROR_MSG = "Missing or incorrect paramater(s)."
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG =
    "An error occurred while searching for flight data. Try again.";

/**
 * Get flights from given origin to given destination on a given date
 * example request body:
 * {
 *      "origin": "SEA",
 *      "dest": "PARIS",
 *      "date": "10/22/2022"
 * }
 */
app.post("/flights", async (req, res) => {
    let origin = req.body.origin;
    let dest = req.body.dest;
    let date = req.body.date;

    let flightData = await getFlightData(origin, dest, date);

    res.send(flightData);
});

/**
 * Queries flight data API to get the flights from origin to dest
 * on the given time
 *
 * @param {String} origin where flight is coming from
 * @param {String} dest where flight is going
 * @param {String} date of flight request
 */
async function getFlightData(origin, dest, date) {
    return await amadeus.client.get(
        '/v2/shopping/flight-offers',
        {
            originLocationCode: origin,
            destinationLocationCode: dest,
            departureDate: date,
            adults: '1'
        })
    .then(function(res){
        let flights = parseFlightsData(res);
        console.log(flights);
        return flights;
    })
    .catch(function(err) {
        console.log(err);
    });
}

/**
 * Parses data into those useful for
 *
 * @param {JSON} response from api call: for flights from origin->dest on date
 *               as given by user
 */
function parseFlightsData(flightsResponse){
    let data = flightsResponse["data"];

    // Create a new object to hold just the data we need
    let price, time, carrier, plane, departure, arrival, co2;
    let flights = [];
    // go through data[] & look at each flight offer
    for (let i = 0; i < data.length; i++) {
        price = data[i]["price"]["total"];
        carrier = [];
        plane = [];
        departure = [];
        arrival = [];
        for(let j = 0; j < (data[i]["itineraries"]).length; j++) {
            time = data[i]["itineraries"][j]["duration"];
            for(let k = 0; k < (data[i]["itineraries"][j]["segments"]).length; k++) {
                departure.push(data[i]["itineraries"][j]["segments"][k]["departure"]["iataCode"]);
                arrival.push(data[i]["itineraries"][j]["segments"][k]["arrival"]["iataCode"]);
                carrier.push(data[i]["itineraries"][j]["segments"][k]["carrierCode"]);
                plane.push(data[i]["itineraries"][j]["segments"][k]["aircraft"]["code"]);
            }
        }
        const flight = {
            totalPrice:price,
            totalDuration:time,
            carrierCode:carrier,
            aircraftCode:plane,
            departureAirportCodes:departure,
            arrivalAirportCodes:arrival,
            airports:[],
            emissions:0,
        };
        //Flights should be an array of json objects
        flights.push(flight);
    }
    console.log(flights);
    return(flights);
}

/**
 * Calculate CO2 emissions for a given flight
 *
 * @param {object} flight object containing data to calculate emissions
 */
async function calculateFlightEmissions(flight){
    // Get paramaters from sql data matching flight codes
    let aircrafts = flight.aircraftCode;
    let depart = flight.departureAirportCodes;
    let arrive = flight.arrivalAirportCodes;
    let totalEmissions;

    // go thorough each segment of the flight
    // (aircrafts, depart, and arrive should all be the same length)
    for (let i = 0; i < aircrafts.length; i++) {
        let db = await getDBConnection("airportcodes.db");
            // SQLite query for name of airport from code
            let airportName = await db.all("SELECT AP.airportname FROM airportcodes AS AP WHERE AP.abbr = (...);");
            flights.airports.push(airportName);

            // Get distance between airports for segment
            let arrCoords = await db.all("SELECT AP.latitude, AP.longitude FROM airportcodes AS AP WHERE AP.abbr = ?;", arrive[i]);
            let depCoords = await db.all("SELECT AP.latitude, AP.longitude FROM airportcodes AS AP WHERE AP.abbr = ?;", depart[i]);
            let dist = getDistanceFromLatLonInKm(aarCoords.latitude, arrCoords.longitude, depCoords.latitude, depCoords.longitude);
        db.close();

        db = await getDBConnection("aircraftcodes.db");
            // SQLite query for aircraft name from abbr
            let aircraftName = await db.all("SELECT AC.aircraftname FROM aircraftcodes AS AC WHERE AC.abbr = ?;", aircrafts[i]);
        db.close();

        db = await getDBConnection("aircraftemissions.db");
            // SQLite query for emission rates from aircraft name
            let aircraftEmissions = await db.all("SELECT E.emissions FROM aircraftemissions AS E WHERE E.aircraftmodel = ?;", aircraftName);
        db.close();

        totalEmissions += emissionsForSegment(dist, aircraftEmissions);
    }
    // add additional carbon pieces (taxiing, etc.)
    // update flights with new data (add arrays we created + emissions)
}

/**
 *
 * @param {Integer} distance
 * @param {String} aircraftEmissions
 */
function emissionsForSegment (distance, aircraftEmissions) {
    // parse aircraft emissions
    // do *
    // return
}

async function getDBConnection(database) {
    const db = await sqlite.open({
      filename: database,
      driver: sqlite3.Database
    });
    return db;
}

// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})