const axios = require("axios");
const { PAYSPRINT } = require("../config/env");
const { generatePaySprintToken } = require("./paysprint/paysprint.helper");

/**
 * Fetch operator list from PaySprint
 * POST {BASE_URL}/recharge/recharge/getoperator
 */
exports.fetchOperators = async () => {
  try {
    const response = await axios.post(
      `${PAYSPRINT.BASE_URL}/recharge/recharge/getoperator`,
      {},
      {
        headers: {
          Authorisedkey: PAYSPRINT.AUTHORISED_KEY,
          Token: generatePaySprintToken(),
          accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Operator API Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch operators");
  }
};
