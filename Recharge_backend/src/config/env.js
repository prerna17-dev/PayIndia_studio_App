const dotenv = require("dotenv");
dotenv.config();

const requiredVars = [
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "JWT_SECRET",
  "PAYSPRINT_BASE_URL",
  "PAYSPRINT_AUTHORISED_KEY",
  "PAYSPRINT_PARTNER_ID",
  "PAYSPRINT_JWT_SECRET",
];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  DB: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    NAME: process.env.DB_NAME,
    PORT: process.env.DB_PORT || 3306,
  },

  JWT_SECRET: process.env.JWT_SECRET,

  PAYSPRINT: {
    BASE_URL: process.env.PAYSPRINT_BASE_URL,
    AUTHORISED_KEY: process.env.PAYSPRINT_AUTHORISED_KEY,
    PARTNER_ID: process.env.PAYSPRINT_PARTNER_ID,
    JWT_SECRET: process.env.PAYSPRINT_JWT_SECRET,
  },
};
