require("dotenv").config();
const pool = require("./src/config/db");

async function list() {
    try {
        const [records] = await pool.query("SELECT id, farmer_name, aadhaar_number, mobile_number FROM service_pm_kisan ORDER BY id DESC LIMIT 5");
        console.log(JSON.stringify(records, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
list();
