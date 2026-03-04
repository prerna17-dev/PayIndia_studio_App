const axios = require("axios");
const jwt = require("jsonwebtoken");
const fs = require("fs");
require("dotenv").config();

const PAYSPRINT = {
    BASE_URL: process.env.PAYSPRINT_BASE_URL,
    AUTHORISED_KEY: process.env.PAYSPRINT_AUTHORISED_KEY,
    PARTNER_ID: process.env.PAYSPRINT_PARTNER_ID,
    JWT_SECRET: process.env.PAYSPRINT_JWT_SECRET,
};

function generateToken() {
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
        timestamp: timestamp,
        partnerId: PAYSPRINT.PARTNER_ID,
        reqid: timestamp.toString(),
    };
    return jwt.sign(payload, PAYSPRINT.JWT_SECRET, { algorithm: "HS256" });
}

const getHeaders = () => ({
    Authorisedkey: PAYSPRINT.AUTHORISED_KEY,
    Token: generateToken(),
    accept: "application/json",
    "Content-Type": "application/json",
});

async function testEndpoint(name, path, body = {}) {
    const baseUrl = PAYSPRINT.BASE_URL.endsWith("/") ? PAYSPRINT.BASE_URL : `${PAYSPRINT.BASE_URL}/`;
    const fullUrl = baseUrl + path;

    let result = { name, url: fullUrl, status: null, data: null, error: null };
    try {
        const res = await axios.post(fullUrl, body, { headers: getHeaders(), timeout: 10000 });
        result.status = res.status;
        result.data = res.data;
    } catch (err) {
        result.status = err.response?.status;
        result.error = err.response?.data;
    }
    return result;
}

async function run() {
    const tests = [
        { name: "Bus Source City (Standard)", path: "bus/ticket/getsourcecity", body: {} },
        { name: "Bus Source City (With Travel)", path: "travel/bus/ticket/getsourcecity", body: {} },
        { name: "Merchant Status Check (Air)", path: "travel/air/merchant/status_check", body: { merchantcode: PAYSPRINT.PARTNER_ID } },
        { name: "Merchant Status Check (Bus)", path: "travel/bus/merchant/status_check", body: { merchantcode: PAYSPRINT.PARTNER_ID } },
    ];

    let results = [];
    for (const t of tests) {
        results.push(await testEndpoint(t.name, t.path, t.body));
    }

    fs.writeFileSync("debug_results.json", JSON.stringify(results, null, 2));
    console.log("Tests complete. Results in debug_results.json");
}

run();
