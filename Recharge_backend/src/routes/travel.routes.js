const express = require("express");
const router = express.Router();
const travelController = require("../controllers/travel.controller");
const auth = require("../middlewares/auth.middleware");

/**
 * TRAVEL ROUTES (Flight, Train, Bus)
 * Integration with PaySprint APIs
 */

// --- MERCHANT STATUS ---
router.post("/merchant-status", auth, travelController.checkMerchantStatus);

// --- BUS ROUTES ---

// 1. Get Source City
router.post("/bus/source-city", auth, travelController.getBusSourceCity);

// 2. Get Destination City
router.post("/bus/destination-city", auth, travelController.getBusDestinationCity);

// 3. Search Available Trips
router.post("/bus/search", auth, travelController.searchBus);

// 4. Get Current Trip Details
router.post("/bus/details", auth, travelController.getBusDetails);

// 5. Get Boarding Point Detail
router.post("/bus/boarding-points", auth, travelController.getBoardingPoints);

// 6. Book Ticket (Handles Block + Book flow)
router.post("/bus/book", auth, travelController.bookBus);

// 7. Check Booked Ticket (by PNR)
router.post("/bus/check-booking", auth, travelController.checkBusBooking);

// 8. Get Booked Ticket (by Reference ID)
router.post("/bus/get-ticket", auth, travelController.getBusTicket);

// 9. Get Cancelation Data
router.post("/bus/cancel-data", auth, travelController.getBusCancelationData);

// 10. Ticket Cancelation
router.post("/bus/cancel-ticket", auth, travelController.cancelBusTicket);


// --- FLIGHT ROUTES ---

// 1. Generate Flight URL
router.post("/flight/generate-url", auth, travelController.generateFlightUrl);

// 2. Check Flight Status
router.post("/flight/status", auth, travelController.checkFlightStatus);


// --- TRAIN ROUTES ---

// 1. Generate Train URL
router.post("/train/generate-url", auth, travelController.generateTrainUrl);

// 2. Check Train Status
router.post("/train/status", auth, travelController.checkTrainStatus);

module.exports = router;
