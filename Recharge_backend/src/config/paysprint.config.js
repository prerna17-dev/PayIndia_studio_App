const { PAYSPRINT } = require("./env");
const { generatePaySprintToken } = require("../services/paysprint/paysprint.helper");

/**
 * PaySprint API endpoints (relative to BASE_URL)
 */
const PAYSPRINT_ENDPOINTS = {
  GET_OPERATOR: "/recharge/recharge/getoperator",
  DO_RECHARGE: "/recharge/recharge/dorecharge",
  STATUS_ENQUIRY: "/recharge/recharge/status",
};

/**
 * Common PaySprint headers with dynamically generated JWT token
 */
function getPaySprintHeaders() {
  return {
    Authorisedkey: PAYSPRINT.AUTHORISED_KEY,
    Token: generatePaySprintToken(),
    accept: "application/json",
    "Content-Type": "application/json",
  };
}

module.exports = {
  PAYSPRINT_BASE_URL: PAYSPRINT.BASE_URL,
  PAYSPRINT_ENDPOINTS,
  getPaySprintHeaders,
};
