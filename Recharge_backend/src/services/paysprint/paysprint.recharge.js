const { instance, getHeaders } = require("./paysprint.helper");

/**
 * Do Mobile Recharge via PaySprint
 * POST {BASE_URL}/recharge/recharge/dorecharge
 *
 * Body: { operator, canumber, amount, referenceid }
 */
exports.mobileRecharge = async (data) => {
  const payload = {
    operator: String(data.operator),       // operator code (must be string)
    canumber: String(data.number),          // mobile number to recharge
    amount: String(data.amount),            // recharge amount
    referenceid: String(data.referenceid),  // unique reference ID
  };

  try {
    const response = await instance.post(
      "/recharge/recharge/dorecharge",
      payload,
      { headers: getHeaders() }
    );

    return response.data;
  } catch (err) {
    console.error(
      "PaySprint Recharge Error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

/**
 * Check Recharge Status via PaySprint
 * POST {BASE_URL}/recharge/recharge/status
 *
 * Body: { referenceid }
 */
exports.checkRechargeStatus = async (referenceid) => {
  const payload = { referenceid };

  try {
    const response = await instance.post(
      "/recharge/recharge/status",
      payload,
      { headers: getHeaders() }
    );

    return response.data;
  } catch (err) {
    console.error(
      "PaySprint Status Enquiry Error:",
      err.response?.data || err.message
    );
    throw err;
  }
};
