const axios = require("axios");
const { PAYSPRINT } = require("../config/env");
const { generatePaySprintToken } = require("../services/paysprint/paysprint.helper");

/**
 * Quick test to check if PaySprint connection works
 * GET /api/system/test-paysprint
 */
exports.testPaySprint = async (req, res) => {
  try {
    const token = generatePaySprintToken();

    console.log("Testing PaySprint with:");
    console.log("  URL:", `${PAYSPRINT.BASE_URL}/recharge/recharge/getoperator`);
    console.log("  Authorisedkey:", PAYSPRINT.AUTHORISED_KEY);
    console.log("  Token:", token);

    const response = await axios.post(
      `${PAYSPRINT.BASE_URL}/recharge/recharge/getoperator`,
      {},
      {
        headers: {
          Authorisedkey: PAYSPRINT.AUTHORISED_KEY,
          Token: token,
          accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return res.json({
      message: "PaySprint connection successful",
      data: response.data,
    });
  } catch (err) {
    console.error("PaySprint Test Error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "PaySprint connection failed",
      error: err.response?.data || err.message,
    });
  }
};

/**
 * Quick test for DoRecharge API
 * POST /api/system/test-dorecharge
 * Body: { operator, canumber, amount, referenceid }
 */
exports.testDoRecharge = async (req, res) => {
  try {
    const token = generatePaySprintToken();
    const { operator, canumber, amount, referenceid } = req.body;

    if (!operator || !canumber || !amount || !referenceid) {
      return res.status(400).json({
        message: "Required fields: operator, canumber, amount, referenceid",
      });
    }

    console.log("Testing DoRecharge API:");
    console.log("  URL:", `${PAYSPRINT.BASE_URL}/recharge/recharge/dorecharge`);

    const response = await axios.post(
      `${PAYSPRINT.BASE_URL}/recharge/recharge/dorecharge`,
      { operator, canumber, amount, referenceid },
      {
        headers: {
          Authorisedkey: PAYSPRINT.AUTHORISED_KEY,
          Token: token,
          accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return res.json({
      message: "DoRecharge API response received",
      data: response.data,
    });
  } catch (err) {
    console.error("DoRecharge Test Error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "DoRecharge API call failed",
      error: err.response?.data || err.message,
    });
  }
};

/**
 * Quick test for Recharge Status API
 * POST /api/system/test-status
 * Body: { referenceid }
 */
exports.testRechargeStatus = async (req, res) => {
  try {
    const token = generatePaySprintToken();
    const { referenceid } = req.body;

    if (!referenceid) {
      return res.status(400).json({
        message: "Required field: referenceid",
      });
    }

    console.log("Testing Recharge Status API:");
    console.log("  URL:", `${PAYSPRINT.BASE_URL}/recharge/recharge/status`);

    const response = await axios.post(
      `${PAYSPRINT.BASE_URL}/recharge/recharge/status`,
      { referenceid },
      {
        headers: {
          Authorisedkey: PAYSPRINT.AUTHORISED_KEY,
          Token: token,
          accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return res.json({
      message: "Recharge Status API response received",
      data: response.data,
    });
  } catch (err) {
    console.error("Status Test Error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Recharge Status API call failed",
      error: err.response?.data || err.message,
    });
  }
};
