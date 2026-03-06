require("dotenv").config();
const pool = require("./src/config/db");

async function checkDb() {
    try {
        const [rows] = await pool.query("SELECT id, reference_id, dob, aadhaar_card_url, photo_url FROM income_certificates ORDER BY id DESC");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
