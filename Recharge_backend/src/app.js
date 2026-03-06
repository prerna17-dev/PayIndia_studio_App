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
const paysprint = require("./routes/paysprintTest.routes");
const bill = require("./routes/bill.routes");
const operatorRoutes = require("./routes/operator.routes");
const aadharRoutes = require("./routes/aadhar.routes");
const panRoutes = require("./routes/pan.routes");
const voterRoutes = require("./routes/voter.routes");
const incomeRoutes = require("./routes/income.routes");
const casteRoutes = require("./routes/caste.routes");
const domicileRoutes = require("./routes/domicile.routes");
const birthRoutes = require("./routes/birth.routes");
const deathRoutes = require("./routes/death.routes");
const marriageRoutes = require("./routes/marriage.routes");
const ewsRoutes = require("./routes/ews.routes");
const nclRoutes = require("./routes/ncl.routes");
const land712Routes = require("./routes/land_712.routes");
const land8aRoutes = require("./routes/land_8a.routes");
const propertyTaxRoutes = require("./routes/property_tax.routes");
const ferfarRoutes = require("./routes/ferfar.routes");
const udyamRoutes = require("./routes/udyam.routes");
const pmKisanRoutes = require("./routes/pm_kisan.routes");
const seniorCitizenRoutes = require("./routes/senior_citizen.routes");
const employmentRoutes = require("./routes/employment.routes");
const ayushmanRoutes = require("./routes/ayushman.routes");
const rationCardRoutes = require("./routes/ration_card.routes");




const app = express();

/* -------------------- GLOBAL MIDDLEWARES -------------------- */

// security headers
app.use(helmet());

// CORS (adjust origin in production)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
app.use("/api/system", paysprint);
app.use("/api/bill", bill);
app.use("/api/operators", operatorRoutes);
app.use("/api/aadhar", aadharRoutes);
app.use("/api/pan", panRoutes);
app.use("/api/voter", voterRoutes);
app.use("/api/certificate/income", incomeRoutes);
app.use("/api/certificate/caste", casteRoutes);
app.use("/api/certificate/domicile", domicileRoutes);
app.use("/api/certificate/birth", birthRoutes);
app.use("/api/certificate/death", deathRoutes);
app.use("/api/certificate/marriage", marriageRoutes);
app.use("/api/certificate/ews", ewsRoutes);
app.use("/api/certificate/ncl", nclRoutes);
app.use("/api/land/712", land712Routes);
app.use("/api/land/8a", land8aRoutes);
app.use("/api/land/property-tax", propertyTaxRoutes);
app.use("/api/land/ferfar", ferfarRoutes);
app.use("/api/business/udyam", udyamRoutes);
app.use("/api/social/pm-kisan", pmKisanRoutes);
app.use("/api/social/senior-citizen", seniorCitizenRoutes);
app.use("/api/social/employment", employmentRoutes);
app.use("/api/social/ayushman", ayushmanRoutes);
app.use("/api/social/ration-card", rationCardRoutes);



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
