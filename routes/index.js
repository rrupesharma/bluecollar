const express = require("express");
const admin = require("./admin.routes");
const domain = require("./domain.routes");
const category = require("./category.routes");
const page = require("./page.routes");
const contactus = require("./contactus.routes");

const router = express.Router();

router.use("/admin", admin);
router.use("/domain", domain);
router.use("/category", category);
router.use("/page", page);
router.use("/contactus", contactus);

module.exports = router;
