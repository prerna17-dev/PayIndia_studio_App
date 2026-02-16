const { instance, getHeaders } = require("./paysprint.helper");

exports.verifyBankAccount = async (payload) => {
  try {
    const response = await instance.post(
      "/bank/verify",
      payload,
      { headers: getHeaders(payload) }
    );

    return response.data;
  } catch (err) {
    throw new Error("Bank verification failed");
  }
};

exports.moneyTransfer = async (payload) => {
  try {
    const response = await instance.post(
      "/dmt/transfer",
      payload,
      { headers: getHeaders(payload) }
    );

    return response.data;
  } catch (err) {
    throw new Error("Money transfer failed");
  }
};

/**
 * Fetch Bank List from PaySprint
 * POST {BASE_URL}/aeps/banklist/index
 */
exports.fetchBankList = async () => {
  try {
    const response = await instance.post(
      "/aeps/banklist/index",
      {},
      { headers: getHeaders() }
    );

    // Log the response to debug structure
    console.log("PaySprint Bank List Response:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (err) {
    console.error(
      "PaySprint Bank List Error:",
      err.response?.data || err.message
    );
    throw new Error(err.response?.data?.message || "Failed to fetch bank list");
  }
};
