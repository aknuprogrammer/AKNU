// routes/locationRoutes.js
const express = require("express");
const { updateLocation, startTrip, endTrip } = require("../../controllers/faculty_track/locationController");


const locationRouter = express.Router();

locationRouter.post('/update', updateLocation);
locationRouter.post('/start', startTrip);
locationRouter.post('/end', endTrip);

module.exports = locationRouter;
