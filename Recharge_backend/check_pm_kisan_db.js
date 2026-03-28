require("dotenv").config();
const pool = require("./src/config/db");

async function checkDb() {
    try {
        console.log("--- service_pm_kisan Columns ---");
        const [kisanColumns] = await pool.query("DESCRIBE service_pm_kisan");
        console.table(kisanColumns);

        console.log("\n--- service_pm_kisan Existing Records (Last 5) ---");
        const [records] = await pool.query("SELECT id, farmer_name, aadhaar_number, mobile_number FROM service_pm_kisan ORDER BY id DESC LIMIT 5");
        console.table(records);

        console.log("\n--- Checking for service_pm_kisan_correction Table ---");
        try {
            const [correctionColumns] = await pool.query("DESCRIBE service_pm_kisan_correction");
            console.table(correctionColumns);
        } catch (e) {
            console.log("service_pm_kisan_correction table does not exist.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
