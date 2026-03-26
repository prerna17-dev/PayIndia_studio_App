const pool = require("./src/config/db");

async function checkSchema() {
    try {
        const [rows] = await pool.query("DESCRIBE birth_certificates");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
