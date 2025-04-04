const jwt = require("jsonwebtoken");
const BlackListTokens = require("../models/blackListTokenModel.js");
const status = require("../utils/httpStatusText.js");
const AppError = require("../utils/appErrors.js");
const verifyToken = (req, res, next) => {
  const bearerHeader =
    req.headers["authorization"] || req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    const decodedToken = jwt.verify(bearerToken, process.env.JWT_SECRET_KEY, {
      expiresIn: "1m",
    });
    console.log(decodedToken);

    next();
  } else {
    res.status(403).send("Forbidden Access you need to login first");
  }
};
////////////////////////check if token us blacklisted/////////////////////////////

const isTokenBlackListed = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token
  console.log(req.headers.authorization);
  if (!token) {
    const error = AppError.createError(
      "missing token (middleWare)",
      404,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const blacklisted = await BlackListTokens.findOne({ token });
  if (blacklisted) {
    const error = AppError.createError(
      "Token Is Black Listed!!",
      401,
      status.BAD_REQUEST
    );
    return next(error);
  }
  next();
};

module.exports = { verifyToken, isTokenBlackListed };
