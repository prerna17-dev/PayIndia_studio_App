const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "../logs/access.log");

module.exports = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const log = `${new Date().toISOString()} | ${req.method} ${
      req.originalUrl
    } | ${res.statusCode} | ${Date.now() - start}ms | ${
      req.ip
    }\n`;

    fs.appendFile(logFilePath, log, (err) => {
      if (err) console.error("Access log write failed");
    });
  });

  next();
};
