const http = require("http");
const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;

/* -------------------- CREATE SERVER -------------------- */
const server = http.createServer(app);

/* -------------------- START SERVER -------------------- */
server.listen(PORT, async () => { 
  try {
    // Test DB connection once on startup
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully");
    conn.release();

    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err) {
    console.error("❌ Database connection failed on startup:", err.message);
    process.exit(1);
  }
});

/* -------------------- GRACEFUL SHUTDOWN -------------------- */
const shutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log("✅ Database pool closed");
      console.log("👋 Server stopped gracefully");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during shutdown:", err.message);
      process.exit(1);
    }
  });
};

// PM2 / Docker / Linux signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

/* -------------------- UNHANDLED ERRORS -------------------- */
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
