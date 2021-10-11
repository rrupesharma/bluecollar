const express = require("express");
const router = express.Router();
const { verify } = require("../middleware/auth");
const domain = require("../controllers/domain.controllers");

router.post("/create", verify, domain.create);
router.post("/list", verify, domain.getAll);
router.get("/list/:id", verify, domain.getById);
router.put("/update", verify, domain.update);
router.delete("/delete/:id", verify, domain.del);

module.exports = router;
