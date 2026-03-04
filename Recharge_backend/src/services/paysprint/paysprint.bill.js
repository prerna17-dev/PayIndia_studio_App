const { instance, getHeaders } = require("./paysprint.helper");

/**
 * Get Bill Operators
 * GET /bill-payment/bill/getoperator
 */
exports.getBillOperators = async () => {
  try {
    const response = await instance.get(
      "bill-payment/bill/getoperator",
      { headers: getHeaders() }
    );

    return response.data;
  } catch (err) {
    console.error(
      "PaySprint Bill Operators Error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

/**
 * Fetch Bill Details
 * POST /bill-payment/bill/fetchbill
 */
exports.fetchBill = async (data) => {
  try {
    const response = await instance.post(
      "bill-payment/bill/fetchbill",
      data,
      { headers: getHeaders() }
    );

    return response.data;
  } catch (err) {
    console.error(
      "PaySprint Fetch Bill Error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

/**
 * Pay Bill
 * POST /bill-payment/bill/paybill
 */
exports.payBill = async (data) => {
  const payload = {
    operator: String(data.operator),
    canumber: String(data.canumber),
    amount: String(data.amount),
    referenceid: String(data.referenceid),
    latitude: String(data.latitude || "28.6139"),   // default Delhi
    longitude: String(data.longitude || "77.2090")  // default Delhi
  };

  try {
    const response = await instance.post(
      "bill-payment/bill/paybill",
      payload,
      { headers: getHeaders() }
    );

    return response.data;
  } catch (err) {
    console.error(
      "PaySprint Pay Bill Error:",
      err.response?.data || err.message
    );
    throw err;
  }
};


/**
 * Bill Status
 * POST /bill-payment/bill/status
 */
exports.checkBillStatus = async (referenceid) => {
  try {
    const response = await instance.post(
      "bill-payment/bill/status",
      { referenceid },
      { headers: getHeaders() }
    );

    return response.data;
  } catch (err) {
    console.error(
      "PaySprint Bill Status Error:",
      err.response?.data || err.message
    );
    throw err;
  }
};
