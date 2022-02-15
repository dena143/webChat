const router = require("express").Router();

const { login, register } = require("../controllers/auth");
const { validate } = require("../middleware/validator");
const {
  rules: registrationRules,
} = require("../middleware/validator/auth/register");
const { rules: loginRules } = require("../middleware/validator/auth/login");

router.post("/login", [loginRules, validate], login);

router.post("/register", [registrationRules, validate], register);

module.exports = router;
