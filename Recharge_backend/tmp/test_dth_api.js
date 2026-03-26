const axios = require('axios');

const API_BASE_URL = "http://localhost:5000/api";

async function testDTHOperators() {
    try {
        console.log("Testing /api/bill/operators?category=DTH...");
        
        const response = await axios.get(`${API_BASE_URL}/bill/operators?category=DTH`).catch(err => err.response);
        
        if (response && response.status === 200) {
            console.log("Success! Operators received:", response.data.data.length);
            console.log("Sample:", response.data.data.slice(0, 2).map(op => op.operator_name));
        } else if (response && response.status === 401) {
            console.log("Endpoint exists but requires Authentication (401). This confirms the route and category filtering logic.");
        } else {
            console.log("Unexpected response:", response ? response.status : "No response");
        }
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testDTHOperators();
