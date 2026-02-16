require("./src/config/env");

const { instance, getHeaders } = require("./src/services/paysprint/paysprint.helper");

const fs = require('fs');

(async () => {
    try {
        console.log("Fetching bank list from PaySprint...");
        const response = await instance.post(
            "/aeps/banklist/index",
            {},
            { headers: getHeaders() }
        );
        fs.writeFileSync("bank-list.json", JSON.stringify(response.data, null, 2));
        console.log("Response written to bank-list.json");
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
})();
