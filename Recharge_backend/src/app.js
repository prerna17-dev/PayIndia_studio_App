const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("./config/env"); // load & validate env

const requestLogger = require("./middlewares/requestLogger.middleware");
const errorHandler = require("./middlewares/error.middleware");

// routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const walletRoutes = require("./routes/wallet.routes");
const rechargeRoutes = require("./routes/recharge.routes");
const bankingRoutes = require("./routes/banking.routes");
const agentRoutes = require("./routes/agent.routes");
const adminRoutes = require("./routes/admin.routes");
const reportRoutes = require("./routes/report.routes");
const travelRoutes = require("./routes/travel.routes");
const paysprint =require("./routes/paysprintTest.routes");



const app = express();

/* -------------------- GLOBAL MIDDLEWARES -------------------- */

// security headers
app.use(helmet());

// CORS (adjust origin in production)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// request parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// access logging
app.use(requestLogger);

// optional console logging (disable in prod if needed)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* -------------------- STATIC FILES -------------------- */
// profile images & documents
app.use("/uploads", express.static("src/uploads"));

/* -------------------- ROUTES -------------------- */

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "payIndiastudio-backend",
    time: new Date(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/recharge", rechargeRoutes);
app.use("/api/banking", bankingRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api/system",paysprint);

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* -------------------- ERROR HANDLER (MUST BE LAST) -------------------- */
app.use(errorHandler);

module.exports = app;
