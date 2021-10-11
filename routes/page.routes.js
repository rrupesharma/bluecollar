const express = require("express");
const router = express.Router();
const { verify } = require("../middleware/auth");
const page = require("../controllers/page.controllers");

router.post("/create", verify, page.create);
router.post("/list", verify, page.getAll);
router.get("/list/:id", verify, page.getById);
router.put("/update", verify, page.update);
router.delete("/del/:id", verify, page.del);

module.exports = router;
