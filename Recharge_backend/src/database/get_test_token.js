require("../config/env");
const jwt = require("jsonwebtoken");

const getTestToken = () => {
    const payload = {
        userId: 1,
        mobile: "9876543210",
        role: "USER"
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    console.log("-------------------- TEST TOKEN --------------------");
    console.log(token);
    console.log("----------------------------------------------------");
};

getTestToken();
