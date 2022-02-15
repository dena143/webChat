const router = require("express").Router();

router.get("/home", (req, res) => {
  return res.send("Home Screen");
});

router.use("/", require("./auth"));
router.use("/user", require("./user"));
router.use("/chat", require("./chat"));

module.exports = router;
