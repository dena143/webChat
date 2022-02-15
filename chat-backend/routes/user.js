const router = require("express").Router();

const { update, search } = require("../controllers/user");
const { validate } = require("../middleware/validator");
const { auth } = require("../middleware/auth/auth");
const { rules: updateRules } = require("../middleware/validator/user/update");
const { uploadImage } = require("../utils/upload");

router.patch("/update", [auth, uploadImage, updateRules, validate], update);
router.get("/search-users", auth, search);

module.exports = router;
