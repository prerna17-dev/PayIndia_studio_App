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

async function testEndpoint(name, path) {
    const baseUrl = PAYSPRINT.BASE_URL.endsWith("/") ? PAYSPRINT.BASE_URL : `${PAYSPRINT.BASE_URL}/`;
    const fullUrl = baseUrl + path;

    try {
        const res = await axios.post(fullUrl, {}, { headers: getHeaders(), timeout: 10000 });
        return { name, status: res.status, data: res.data };
    } catch (err) {
        let errorData = err.response?.data;
        if (typeof errorData === 'string' && errorData.includes('html')) {
            errorData = "HTML 404 Page";
        }
        return { name, status: err.response?.status, error: errorData };
    }
}

async function run() {
    const paths = [
        "bus/bus/getsourcecity",
        "bus/ticket/getsourcecity",
        "travel/bus/getsourcecity",
        "travel/bus/ticket/getsourcecity",
        "travel/air/merchant/status_check", // confirmed working
        "travel/bus/merchant/status_check",
        "bus/merchant/status_check"
    ];

    let results = [];
    for (const p of paths) {
        results.push(await testEndpoint(p, p));
    }

    fs.writeFileSync("debug_results_v2.json", JSON.stringify(results, null, 2));
}

run();
