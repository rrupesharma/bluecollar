const express = require("express");
const admin = require("./admin.routes");
const domain = require("./domain.routes");
const category = require("./category.routes");

const router = express.Router();

router.use("/admin", admin);
router.use("/domain", domain);
router.use("/category", category);

module.exports = router;
