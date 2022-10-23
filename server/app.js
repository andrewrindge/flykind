const express = require('express');
const app = express();

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

// URL to access AirLabs API
const AIRLABS_URL = "";

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

    let data = await getFlightData(origin, dest, date);
    res.send(data);

    // res.send("Flights from " + origin + " to " + dest + " on " + date + " are ");
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
    await amadeus.client.get(
        '/v2/shopping/flight-offers',
        {
            originLocationCode: 'SYD',
            destinationLocationCode: 'BKK',
            departureDate: '2022-11-10',
            adults: '1'
        }
    ).then(function(response){
        console.log(response);
        return response;
    }).catch(function(err) {
        console.log(err);
    });
}

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})