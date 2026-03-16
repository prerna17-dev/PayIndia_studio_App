const pool = require("../config/db");

exports.getDashboard = async (req, res, next) => {
  try {
    // Helper to get status-wise counts for a table
    const getServiceStats = async (table) => {
      const [rows] = await pool.query(`SELECT status, COUNT(*) as count FROM ${table} GROUP BY status`);
      const stats = { Total: 0, Pending: 0, Approved: 0, Processed: 0, Rejected: 0 };
      rows.forEach(r => {
        stats.Total += r.count;
        if (stats.hasOwnProperty(r.status)) stats[r.status] = r.count;
      });
      return stats;
    };

    const aadharStats = await getServiceStats("aadhar_enrollments");
    const esevaStats = await getServiceStats("eseva_applications");
    const panStats = await getServiceStats("pan_applications");

    res.json({
      success: true,
      message: "Agent dashboard data",
      data: {
        aadhar: aadharStats,
        eseva: esevaStats,
        pan: panStats
      }
    });
  } catch (err) {
    next(err);
  }
};
