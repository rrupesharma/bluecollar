const express = require("express");
const router = express.Router();
// const { verify } = require("../middleware/auth");
const contactus = require("../controllers/contactUs.controllers");

router.post("/create", contactus.create);

module.exports = router;
