const axios = require("axios");
const jwt = require("jsonwebtoken");
const { PAYSPRINT } = require("../../config/env");

/**
 * Generate PaySprint JWT token dynamically
 * Payload matches PaySprint's expected format:
 * { timestamp, partnerId, reqid }
 */
function generatePaySprintToken() {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = {
    timestamp: timestamp,
    partnerId: PAYSPRINT.PARTNER_ID,
    reqid: timestamp.toString(),
  };

  return jwt.sign(payload, PAYSPRINT.JWT_SECRET, { algorithm: "HS256" });
}

/**
 * Axios instance for PaySprint API calls
 */
const instance = axios.create({
  baseURL: PAYSPRINT.BASE_URL,
  timeout: 15000,
});

/**
 * PaySprint headers: Authorisedkey + dynamically generated Token
 */
const getHeaders = () => ({
  Authorisedkey: PAYSPRINT.AUTHORISED_KEY,
  Token: generatePaySprintToken(),
  accept: "application/json",
  "Content-Type": "application/json",
});

module.exports = {
  instance,
  getHeaders,
  generatePaySprintToken,
};
