const axios = require('axios');

const API_BASE_URL = "http://localhost:5000/api";

async function testElectricityOperators() {
    try {
        console.log("Testing /api/bill/operators?category=Electricity...");
        
        const response = await axios.get(`${API_BASE_URL}/bill/operators?category=Electricity`).catch(err => err.response);
        
        if (response && response.status === 200) {
            console.log("Success! Data received:", JSON.stringify(response.data).substring(0, 200) + "...");
            const electricityOps = response.data.data;
            if (Array.isArray(electricityOps)) {
                console.log(`Found ${electricityOps.length} electricity operators.`);
            }
        } else if (response && response.status === 401) {
            console.log("Endpoint exists but requires Authentication (401). This confirms the route and controller logic are correctly mapped.");
        } else {
            console.log("Unexpected response:", response ? response.status : "No response");
        }
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testElectricityOperators();
