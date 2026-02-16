const pool = require("../config/db");

exports.transactionReport = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100"
  );
  res.json(rows);
};
