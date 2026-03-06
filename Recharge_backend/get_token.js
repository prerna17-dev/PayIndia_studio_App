require("dotenv").config();
const jwt = require("jsonwebtoken");

const payload = {
    userId: 1, // As seen in check_db record 8
    role: "USER"
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
console.log(token);
