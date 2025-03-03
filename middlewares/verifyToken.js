const jwt = require("jsonwebtoken");
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

module.exports = verifyToken;
