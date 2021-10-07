const express = require("express");
const router = express.Router();
const { verify } = require("../middleware/auth");
const domain = require("../controllers/domain.controllers");

router.post("/create", verify, domain.create);
router.post("/list", domain.getAll);
router.get("/list/:id", domain.getById);
router.put("/update", verify, domain.update);
router.delete("/delete/:id", domain.del);

module.exports = router;
