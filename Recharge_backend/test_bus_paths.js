const axios = require("axios");
const jwt = require("jsonwebtoken");
const fs = require("fs");
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
    let result = { name, url, status: null, data: null, error: null };
    try {
        const res = await axios.post(url, body, {
            headers: {
                Authorisedkey: AUTHORISED_KEY, Token: generateToken(),
                accept: "application/json", "Content-Type": "application/json",
            },
            timeout: 10000
        });
        result.status = res.status;
        result.data = res.data;
    } catch (err) {
        result.status = err.response?.status;
        result.error = typeof err.response?.data === 'string' ? "HTML/String Response" : err.response?.data;
    }
    return result;
}

async function run() {
    const tests = [
        { name: "BUS_REDBUS", url: `${ENV_BASE_URL}/redbus/ticket/getsourcecity` },
        { name: "BUS_TRAVEL_REDBUS", url: `${ENV_BASE_URL}/travel/redbus/ticket/getsourcecity` },
        { name: "BUS_RAW", url: `${ENV_BASE_URL}/bus/raw/getsourcecity` },
        { name: "BUS_NEW", url: `${ENV_BASE_URL}/bus/ticket/getsourcecity`, body: { merchantcode: PARTNER_ID } },
        { name: "AIR_STATUS_WORKING", url: `${ENV_BASE_URL}/travel/air/merchant/status_check`, body: { merchantcode: PARTNER_ID } },
    ];

    let results = [];
    for (const t of tests) {
        results.push(await test(t.name, t.url, t.body || {}));
    }
    fs.writeFileSync("bus_search_results.json", JSON.stringify(results, null, 2));
}

run();
