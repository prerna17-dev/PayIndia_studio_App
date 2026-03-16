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
    const payload = {
        timestamp: timestamp, partnerId: PARTNER_ID, reqid: timestamp.toString()
    };
    return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" });
}

async function test(name, url) {
    let result = { name, url, status: null, data: null, error: null };
    try {
        const res = await axios.post(url, {}, {
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
    const shortBase = "https://sit.paysprint.in/service-api";
    const tests = [
        { name: "RECHARGE_ENV", url: `${ENV_BASE_URL}/recharge/recharge/getoperator` },
        { name: "RECHARGE_SHORT", url: `${shortBase}/recharge/recharge/getoperator` },
        { name: "BUS_ENV", url: `${ENV_BASE_URL}/bus/ticket/getsourcecity` },
        { name: "BUS_SHORT", url: `${shortBase}/bus/ticket/getsourcecity` },
        { name: "BUS_TRAVEL_ENV", url: `${ENV_BASE_URL}/travel/bus/ticket/getsourcecity` },
        { name: "BUS_TRAVEL_SHORT", url: `${shortBase}/travel/bus/ticket/getsourcecity` },
        { name: "AIR_MERCHANT_ENV", url: `${ENV_BASE_URL}/travel/air/merchant/status_check` },
        { name: "AIR_MERCHANT_SHORT", url: `${shortBase}/travel/air/merchant/status_check` },
    ];

    let results = [];
    for (const t of tests) {
        results.push(await test(t.name, t.url));
    }
    fs.writeFileSync("base_url_results.json", JSON.stringify(results, null, 2));
    console.log("Done. Results in base_url_results.json");
}

run();
