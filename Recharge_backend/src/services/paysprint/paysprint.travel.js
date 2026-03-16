const { instance, getHeaders } = require("./paysprint.helper");

/**
 * PaySprint Travel Service - FINAL Fixed Integration
 * Paths updated from official PaySprint Documentation screenshot:
 * https://sit.paysprint.in/service-api/api/v1/service/bus/ticket/source
 */
const paysprintTravel = {
    /**
     * MERCHANT STATUS CHECK
     */
    merchantStatusCheck: async (merchantCode) => {
        try {
            // Usually category/subcategory/action. Based on pattern:
            const response = await instance.post("air/merchant/status_check", { merchantcode: merchantCode }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint merchantStatusCheck Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * BUS TICKET BOOKING APIS (Raw APIs)
     * Corrected paths based on documentation screenshot: bus/ticket/[action]
     */

    // 1. Get Source City
    getBusSourceCity: async () => {
        try {
            const response = await instance.post("bus/ticket/source", {}, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint getBusSourceCity Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 2. Get Destination City (Use source list as PaySprint has no separate destination API)
    getBusDestinationCity: async (sourceid) => {
        try {
            // Note: PaySprint V1 usually returns all cities in the 'source' list.
            // There is no dedicated /destination endpoint in the official docs.
            const response = await instance.post("bus/ticket/source", {}, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint getBusDestinationCity Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 3. Get Available Trips (Search)
    getAvailableTrips: async (data) => {
        try {
            // Ensure date is in YYYY-MM-DD format (replace spaces with dashes)
            const formattedDate = data.date ? data.date.replace(/\s+/g, '-') : data.date;

            const payload = {
                source_city_id: data.sourceid,
                destination_city_id: data.destinationid,
                date_of_journey: formattedDate
            };
            const response = await instance.post("bus/ticket/availabletrips", payload, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint getAvailableTrips Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 4. Get Current Trip Details
    getCurrentTripDetails: async (tripId) => {
        try {
            const response = await instance.post("bus/ticket/tripdetails", { trip_id: tripId }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint getCurrentTripDetails Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 5. Get Boarding Point Detail
    getBoardingPointDetails: async (tripId) => {
        try {
            const response = await instance.post("bus/ticket/boardingpoint", { trip_id: tripId }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint getBoardingPointDetails Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 6. Block Ticket
    blockTicket: async (data) => {
        try {
            const payload = {
                available_trip_id: data.tripid,
                source_city_id: data.sourceid,
                destination_city_id: data.destinationid,
                boarding_point_id: data.boardingpointid,
                dropping_point_id: data.droppingpointid,
                inventory_items: data.inventoryitems,
                count: data.count
            };
            const response = await instance.post("bus/ticket/blockticket", payload, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint blockTicket Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 7. Book Ticket
    bookTicket: async (blockKey) => {
        try {
            const response = await instance.post("bus/ticket/bookticket", { block_key: blockKey }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint bookTicket Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 8. Check Booked Ticket
    checkBookedTicket: async (pnr) => {
        try {
            const response = await instance.post("bus/ticket/checkpnr", { pnr: pnr }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint checkBookedTicket Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 9. Get Booked Ticket
    getBookedTicket: async (referenceid) => {
        try {
            const response = await instance.post("bus/ticket/getbookedticket", { referenceid: referenceid }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint getBookedTicket Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 10. Get Cancelation Data
    getCancelationData: async (pnr) => {
        try {
            const response = await instance.post("bus/ticket/cancellationdata", { pnr: pnr }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint getCancelationData Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // 11. Ticket Cancelation
    ticketCancelation: async (data) => {
        try {
            const response = await instance.post("bus/ticket/cancel", data, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint ticketCancelation Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * FLIGHT TICKET BOOKING APIS
     */

    // Generate Flight URL
    generateFlightUrl: async (data) => {
        try {
            const response = await instance.post("flight/ticket/generateurl", data, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint generateFlightUrl Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // Flight Status Check
    checkFlightStatus: async (referenceid) => {
        try {
            const response = await instance.post("flight/ticket/status", { referenceid }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint checkFlightStatus Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * TRAIN TICKET BOOKING APIS
     */

    // Generate Train URL
    generateTrainUrl: async (data) => {
        try {
            const response = await instance.post("train/ticket/generateurl", data, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint generateTrainUrl Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // Train Status Check
    checkTrainStatus: async (referenceid) => {
        try {
            const response = await instance.post("train/ticket/status", { referenceid }, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("PaySprint checkTrainStatus Error:", error.response?.data || error.message);
            throw error;
        }
    }
};

module.exports = paysprintTravel;
