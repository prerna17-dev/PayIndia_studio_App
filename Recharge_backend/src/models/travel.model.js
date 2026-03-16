const pool = require("../config/db");

const TravelModel = {
    // Create Bus Booking
    createBusBooking: async (data) => {
        const {
            user_id, transaction_id, operator_name, source_city, destination_city,
            travel_date, boarding_point, dropping_point, bus_type, seat_numbers,
            total_amount, status, pnr_number, api_reference, api_response
        } = data;

        const [result] = await pool.query(
            `INSERT INTO bus_bookings 
      (user_id, transaction_id, operator_name, source_city, destination_city, 
       travel_date, boarding_point, dropping_point, bus_type, seat_numbers, 
       total_amount, status, pnr_number, api_reference, api_response) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, transaction_id, operator_name, source_city, destination_city,
                travel_date, boarding_point, dropping_point, bus_type, seat_numbers,
                total_amount, status, pnr_number, api_reference, api_response
            ]
        );
        return result.insertId;
    },

    // Create Flight Booking Template
    createFlightBooking: async (data) => {
        const { user_id, transaction_id = null, url_reference, status, amount } = data;
        const [result] = await pool.query(
            `INSERT INTO flight_bookings 
      (user_id, transaction_id, url_reference, status, amount) 
      VALUES (?, ?, ?, ?, ?)`,
            [user_id, transaction_id, url_reference, status, amount]
        );
        return result.insertId;
    },

    // Create Train Booking Template
    createTrainBooking: async (data) => {
        const { user_id, transaction_id = null, url_reference, status, amount } = data;
        const [result] = await pool.query(
            `INSERT INTO train_bookings 
      (user_id, transaction_id, url_reference, status, amount) 
      VALUES (?, ?, ?, ?, ?)`,
            [user_id, transaction_id, url_reference, status, amount]
        );
        return result.insertId;
    },

    // Update Bus Booking Status
    updateBusStatus: async (id, status, pnr_number = null, api_response = null) => {
        let query = "UPDATE bus_bookings SET status = ?";
        const params = [status];

        if (pnr_number) {
            query += ", pnr_number = ?";
            params.push(pnr_number);
        }
        if (api_response) {
            query += ", api_response = ?";
            params.push(api_response);
        }

        query += " WHERE id = ?";
        params.push(id);

        await pool.query(query, params);
    },

    // Get Bookings by User
    getBookingsByUser: async (userId, type) => {
        let table = "";
        if (type === "bus") table = "bus_bookings";
        else if (type === "flight") table = "flight_bookings";
        else if (type === "train") table = "train_bookings";
        else throw new Error("Invalid booking type");

        const [rows] = await pool.query(`SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
        return rows;
    }
};

module.exports = TravelModel;
