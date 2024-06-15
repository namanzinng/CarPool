const express = require("express");
const { isSignedin } = require("../Controllers/authenticate");

var router = express.Router()
const { drive, ride, cancelTrip, tripDone, tripHistory, activeTrip, isDriver,bookRide ,allRide ,getRide, paymentDone} = require("../Controllers/trip.js");

router.post('/trip/updatePayment/:id',paymentDone);
router.post("/trip/drive", isSignedin, drive) 
router.post("/trip/ride", isSignedin, ride)  
router.delete("/trip", isSignedin, cancelTrip) //
router.post("/trip/done", isSignedin, tripDone) //
router.get("/trip/history", isSignedin, tripHistory)//
router.get("/trip/isdriver", isSignedin, isDriver) 
router.get("/trip/activetrip", isSignedin, activeTrip)
router.post("/trip/bookRide",isSignedin,bookRide)
router.get('/trip/allRide',isSignedin,allRide)
router.get('/trip/:id',getRide);

module.exports = router;
