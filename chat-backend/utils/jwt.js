const jwt = require("jsonwebtoken");
const { appKey } = require("../config/app");

exports.generateToken = (user) => {
  const token = jwt.sign(user, appKey, { expiresIn: 86400 });

  return { ...{ user }, ...{ token } };
};
