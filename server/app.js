const express = require('express');
const app = express();

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
    amadeus.client.get(
        '/v2/shopping/flight-offers',
        {
            originLocationCode: origin,
            destinationLocationCode: dest,
            departureDate: date,
            adults: '1'
        })
    // .then(res => res.json())
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
    // currently this isn't working v
    let dictionary = flightsResponse["dictionaries"];
    //console.log(data);
    //return data;

    // parse the dictionary (in helper funct) to create a single searchable
    // object with aircrafts and carriers (the only components we should use)

    // Create a new object to hold just the data we need
    let price, time, carrier, plane, departure, arrival;
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
            arrivalAirportCodes:arrival
        };
        //Flights should be an array of json objects
        flights.push(flight);
    }
    console.log(flights);
    return(flights);
}

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})