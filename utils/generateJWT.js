require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = async (payload) => {
  const token = await jwt.sign(
    { email: payload.email, id: payload._id },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );
  return token;
};
