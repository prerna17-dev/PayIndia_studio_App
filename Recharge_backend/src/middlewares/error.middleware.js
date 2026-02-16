const fs = require("fs");
const path = require("path");

const errorLogPath = path.join(__dirname, "../logs/error.log");

module.exports = (err, req, res, next) => {
  const log = `
[${new Date().toISOString()}]
METHOD: ${req.method}
URL: ${req.originalUrl}
MESSAGE: ${err.message}
STACK: ${err.stack}
----------------------------------
`;

  fs.appendFile(errorLogPath, log, (error) => {
    if (error) console.error("Error log write failed");
  });

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
};
