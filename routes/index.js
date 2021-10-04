const express = require("express");
const admin = require("./admin.routes");
const domain = require("./domain.routes");

const router = express.Router();

router.use("/admin", admin);
router.use("/domain", domain);

module.exports = router;
