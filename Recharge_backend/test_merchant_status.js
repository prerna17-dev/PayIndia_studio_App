const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const AUTHORISED_KEY = process.env.PAYSPRINT_AUTHORISED_KEY;
const PARTNER_ID = process.env.PAYSPRINT_PARTNER_ID;
const JWT_SECRET = process.env.PAYSPRINT_JWT_SECRET;
const ENV_BASE_URL = process.env.PAYSPRINT_BASE_URL;

function generateToken() {
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = { timestamp, partnerId: PARTNER_ID, reqid: timestamp.toString() };
    return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" });
}

async function test(name, url, body = {}) {
    try {
        const res = await axios.post(url, body, {
            headers: {
                Authorisedkey: AUTHORISED_KEY, Token: generateToken(),
                accept: "application/json", "Content-Type": "application/json",
            },
            timeout: 10000
        });
        console.log(`[${name}] ${res.status}: ${JSON.stringify(res.data)}`);
    } catch (err) {
        console.log(`[${name}] ${err.response?.status}: ${typeof err.response?.data === 'string' ? "HTML/String Response" : JSON.stringify(err.response?.data)}`);
    }
}

async function run() {
    const body = { merchantcode: PARTNER_ID };

    // Test variations of Merchant Status Check
    await test("STATUS_TRAVEL", `${ENV_BASE_URL}/travel/merchant/status_check`, body);
    await test("STATUS_AIR", `${ENV_BASE_URL}/travel/air/merchant/status_check`, body);
    await test("STATUS_BUS", `${ENV_BASE_URL}/travel/bus/merchant/status_check`, body);
    await test("STATUS_TRAIN", `${ENV_BASE_URL}/travel/train/merchant/status_check`, body);

    // Test Merchant Registration variations
    await test("REG_TRAVEL", `${ENV_BASE_URL}/travel/merchant/registration`, body);
    await test("REG_AIR", `${ENV_BASE_URL}/travel/air/merchant/registration`, body);
    await test("REG_BUS", `${ENV_BASE_URL}/travel/bus/merchant/registration`, body);
}

run();
