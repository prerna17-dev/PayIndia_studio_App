const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

exports.hash = async (value) => {
  return await bcrypt.hash(value, SALT_ROUNDS);
};

exports.compare = async (value, hash) => {
  return await bcrypt.compare(value, hash);
};
