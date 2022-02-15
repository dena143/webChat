const jwt = require("jsonwebtoken");

const config = require("../../config/app");

exports.auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorize" });
  }

  jwt.verify(token, config.appKey, (err, user) => {
    if (err) {
      return res.status(401).json({ message: err.message });
    }
    req.user = user;
  });

  next();
};
