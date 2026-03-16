const pool = require("../config/db");

exports.getStats = async (req, res, next) => {
  try {
    // Basic Counts
    const [[users]] = await pool.query("SELECT COUNT(*) total FROM users");

    // Transaction Stats
    const [[txns]] = await pool.query("SELECT COUNT(*) total, SUM(amount) sum FROM transactions");
    const [txnStatus] = await pool.query("SELECT status, COUNT(*) count FROM transactions GROUP BY status");

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
      data: {
        users: { total: users.total },
        transactions: {
          total: txns.total || 0,
          totalAmount: txns.sum || 0,
          breakdown: txnStatus
        },
        services: {
          aadhar: aadharStats,
          eseva: esevaStats,
          pan: panStats
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List all users with optional role filtering
 */
exports.listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = "SELECT user_id, mobile_number, name, role, is_active, created_at FROM users";
    const params = [];

    if (role) {
      query += " WHERE role = ?";
      params.push(role);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user role (Admin only)
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN', 'AGENT'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    await pool.query("UPDATE users SET role = ? WHERE user_id = ?", [role, userId]);

    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (err) {
    next(err);
  }
};
