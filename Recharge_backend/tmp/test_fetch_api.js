const axios = require('axios');

const API_BASE_URL = "http://localhost:5000/api";

async function testFetchBill() {
    try {
        console.log("Testing /api/bill/fetch...");
        
        const response = await axios.post(`${API_BASE_URL}/bill/fetch`, {
            operator: "123", // Dummy operator ID
            canumber: "1234567890" // Dummy CA number
        }).catch(err => err.response);
        
        if (response && response.status === 200) {
            console.log("Success! Data received:", JSON.stringify(response.data).substring(0, 200) + "...");
        } else if (response && response.status === 401) {
            console.log("Endpoint exists but requires Authentication (401). This confirms the route and controller mapping.");
        } else {
            console.log("Unexpected response:", response ? response.status : "No response");
        }
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testFetchBill();
