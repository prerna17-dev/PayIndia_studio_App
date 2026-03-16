require("../config/env");
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const setupTables = async () => {
    try {
        console.log("Reading schema file...");
        const schemaPath = path.join(__dirname, "travel_schemas.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf8");

        // Split by semicolon but handle potential semicolon inside strings if any (simple split here as schemas are clean)
        const queries = schemaSql
            .split(";")
            .map((q) => q.trim())
            .filter((q) => q.length > 0);

        console.log(`Found ${queries.length} queries. Executing...`);

        for (const query of queries) {
            await pool.query(query);
            // Log first line of query
            console.log(`Executed: ${query.split("\n")[0]}...`);
        }

        console.log("✅ All tables created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up tables:", err.message);
        process.exit(1);
    }
};

setupTables();
