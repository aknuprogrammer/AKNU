// import bcrypt from "bcryptjs";
const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  const saltRounds = 10; // recommended cost factor
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };
