const pool = require("../config/db");
const paysprintTravel = require("../services/paysprint/paysprint.travel");
const TravelModel = require("../models/travel.model");

/**
 * Travel Controller
 */

// Merchant Status Check
exports.checkMerchantStatus = async (req, res) => {
  try {
    const { merchantcode } = req.body;
    if (!merchantcode) return res.status(400).json({ message: "merchantcode is required" });
    const result = await paysprintTravel.merchantStatusCheck(merchantcode);
    res.json(result);
  } catch (error) {
    console.error("Merchant Status Check Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Status check failed", error: error.response?.data || error.message });
  }
};

// --- BUS METHODS ---

// Get Bus Source Cities
exports.getBusSourceCity = async (req, res) => {
  try {
    const result = await paysprintTravel.getBusSourceCity();
    res.json(result);
  } catch (error) {
    console.error("Bus Source City Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch source cities", error: error.response?.data || error.message });
  }
};

// Get Bus Destination Cities
exports.getBusDestinationCity = async (req, res) => {
  try {
    const { sourceid } = req.body;
    if (!sourceid) return res.status(400).json({ message: "sourceid is required" });
    const result = await paysprintTravel.getBusDestinationCity(sourceid);
    res.json(result);
  } catch (error) {
    console.error("Bus Destination City Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch destination cities", error: error.response?.data || error.message });
  }
};

// Search Bus Trips
exports.searchBus = async (req, res) => {
  try {
    const { sourceid, destinationid, date } = req.body;
    if (!sourceid || !destinationid || !date) {
      return res.status(400).json({ message: "sourceid, destinationid, and date are required" });
    }
    const result = await paysprintTravel.getAvailableTrips({ sourceid, destinationid, date });
    res.json(result);
  } catch (error) {
    console.error("Bus Search Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to search bus trips", error: error.response?.data || error.message });
  }
};

// Get Bus Trip Details
exports.getBusDetails = async (req, res) => {
  try {
    const { tripid } = req.body;
    if (!tripid) return res.status(400).json({ message: "tripid is required" });
    const result = await paysprintTravel.getCurrentTripDetails(tripid);
    res.json(result);
  } catch (error) {
    console.error("Bus Details Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch trip details", error: error.response?.data || error.message });
  }
};

// Get Bus Boarding Points
exports.getBoardingPoints = async (req, res) => {
  try {
    const { tripid } = req.body;
    if (!tripid) return res.status(400).json({ message: "tripid is required" });
    const result = await paysprintTravel.getBoardingPointDetails(tripid);
    res.json(result);
  } catch (error) {
    console.error("Bus Boarding Points Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch boarding points", error: error.response?.data || error.message });
  }
};

// Check Bus Booking Status (by PNR)
exports.checkBusBooking = async (req, res) => {
  try {
    const { pnr } = req.body;
    if (!pnr) return res.status(400).json({ message: "pnr is required" });
    const result = await paysprintTravel.checkBookedTicket(pnr);
    res.json(result);
  } catch (error) {
    console.error("Check Bus Booking Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to check booking status", error: error.response?.data || error.message });
  }
};

// Get Bus Ticket (by Reference ID)
exports.getBusTicket = async (req, res) => {
  try {
    const { referenceid } = req.body;
    if (!referenceid) return res.status(400).json({ message: "referenceid is required" });
    const result = await paysprintTravel.getBookedTicket(referenceid);
    res.json(result);
  } catch (error) {
    console.error("Get Bus Ticket Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch ticket", error: error.response?.data || error.message });
  }
};

// Get Bus Cancellation Data
exports.getBusCancelationData = async (req, res) => {
  try {
    const { pnr } = req.body;
    if (!pnr) return res.status(400).json({ message: "pnr is required" });
    const result = await paysprintTravel.getCancelationData(pnr);
    res.json(result);
  } catch (error) {
    console.error("Bus Cancelation Data Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch cancelation data", error: error.response?.data || error.message });
  }
};

// Cancel Bus Ticket
exports.cancelBusTicket = async (req, res) => {
  try {
    const { pnr, seats } = req.body;
    if (!pnr || !seats) return res.status(400).json({ message: "pnr and seats are required" });
    const result = await paysprintTravel.ticketCancelation({ pnr, seats });
    res.json(result);
  } catch (error) {
    console.error("Bus Cancelation Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to cancel ticket", error: error.response?.data || error.message });
  }
};

// Book Bus Ticket
exports.bookBus = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.userId;
    const {
      tripid, sourceid, destinationid, boardingpointid, droppingpointid,
      count, inventoryitems, total_amount, operator_name, travel_date, bus_type
    } = req.body;

    if (!tripid || !total_amount) {
      return res.status(400).json({ message: "tripid and total_amount are required" });
    }

    await conn.beginTransaction();

    // Check Balance
    const [[user]] = await conn.query("SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE", [userId]);
    if (user.wallet_balance < total_amount) {
      await conn.rollback();
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Deduct Balance
    await conn.query("UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?", [total_amount, userId]);

    // Create Transaction
    const [txn] = await conn.query(
      "INSERT INTO transactions (user_id, transaction_type, amount, status, description) VALUES (?, 'Wallet_Debit', ?, 'Pending', ?)",
      [userId, total_amount, `Bus booking: ${operator_name}`]
    );

    // Initial Booking Record
    const bookingId = await TravelModel.createBusBooking({
      user_id: userId,
      transaction_id: txn.insertId,
      operator_name,
      source_city: sourceid,
      destination_city: destinationid,
      travel_date,
      boarding_point: boardingpointid,
      dropping_point: droppingpointid,
      bus_type,
      seat_numbers: JSON.stringify(inventoryitems.map(i => i.seatName)),
      total_amount,
      status: 'Pending'
    });

    await conn.commit();

    // Call PaySprint API (Block then Book)
    try {
      const blockRes = await paysprintTravel.blockTicket({
        tripid, sourceid, destinationid, boardingpointid, droppingpointid, count, inventoryitems
      });

      if (blockRes.status && blockRes.blockkey) {
        const bookRes = await paysprintTravel.bookTicket(blockRes.blockkey);

        if (bookRes.status) {
          await TravelModel.updateBusStatus(bookingId, 'Success', bookRes.pnr, JSON.stringify(bookRes));
          await pool.query("UPDATE transactions SET status = 'Success' WHERE transaction_id = ?", [txn.insertId]);
          return res.json({ message: "Booking successful", pnr: bookRes.pnr, bookingId, api_response: bookRes });
        } else {
          throw new Error(bookRes.message || "Booking confirmation failed");
        }
      } else {
        throw new Error(blockRes.message || "Seat blocking failed");
      }
    } catch (apiError) {
      console.error("PaySprint Bus API Error:", apiError.message);
      await TravelModel.updateBusStatus(bookingId, 'Failed', null, JSON.stringify({ error: apiError.message }));
      await pool.query("UPDATE transactions SET status = 'Failed' WHERE transaction_id = ?", [txn.insertId]);
      // Refund
      await pool.query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?", [total_amount, userId]);
      res.status(502).json({ message: "Booking failed", error: apiError.message });
    }
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Bus Booking Error:", error.message);
    res.status(500).json({ message: "Booking failed", error: error.message });
  } finally {
    if (conn) conn.release();
  }
};

// --- FLIGHT METHODS ---

// Generate Flight URL
exports.generateFlightUrl = async (req, res) => {
  try {
    const { firstname, lastname, email } = req.body;
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ message: "firstname, lastname, and email are required" });
    }
    const mobile = req.user.mobile;
    const result = await paysprintTravel.generateFlightUrl({ mobile, firstname, lastname, email });
    if (result.status) {
      await TravelModel.createFlightBooking({
        user_id: req.user.userId,
        transaction_id: null,
        url_reference: result.referenceid || Date.now().toString(),
        status: 'Pending',
        amount: 0
      });
    }
    res.json(result);
  } catch (error) {
    console.error("Flight URL Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to generate flight URL", error: error.response?.data || error.message });
  }
};

// Check Flight Status
exports.checkFlightStatus = async (req, res) => {
  try {
    const { referenceid } = req.body;
    if (!referenceid) return res.status(400).json({ message: "referenceid is required" });
    const result = await paysprintTravel.checkFlightStatus(referenceid);
    res.json(result);
  } catch (error) {
    console.error("Flight Status Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to check flight status", error: error.response?.data || error.message });
  }
};

// --- TRAIN METHODS ---

// Generate Train URL
exports.generateTrainUrl = async (req, res) => {
  try {
    const { firstname, lastname, email } = req.body;
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ message: "firstname, lastname, and email are required" });
    }
    const mobile = req.user.mobile;
    const result = await paysprintTravel.generateTrainUrl({ mobile, firstname, lastname, email });
    if (result.status) {
      await TravelModel.createTrainBooking({
        user_id: req.user.userId,
        transaction_id: null,
        url_reference: result.referenceid || Date.now().toString(),
        status: 'Pending',
        amount: 0
      });
    }
    res.json(result);
  } catch (error) {
    console.error("Train URL Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to generate train URL", error: error.response?.data || error.message });
  }
};

// Check Train Status
exports.checkTrainStatus = async (req, res) => {
  try {
    const { referenceid } = req.body;
    if (!referenceid) return res.status(400).json({ message: "referenceid is required" });
    const result = await paysprintTravel.checkTrainStatus(referenceid);
    res.json(result);
  } catch (error) {
    console.error("Train Status Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to check train status", error: error.response?.data || error.message });
  }
};
