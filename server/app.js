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
app.post("/flights", (req, res) => {
    let origin = req.body.origin;
    let dest = req.body.dest;
    let date = req.body.date;

    getFlightData(origin, dest, date);

    res.send("Flights from " + origin + " to " + dest + " on " + date + " are ");
});

/**
 * Queries flight data API to get the flights from origin to dest
 * on the given time
 *
 * @param {String} origin
 * @param {String} dest
 */
async function getFlightData(origin, dest, date) {
    
}

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})