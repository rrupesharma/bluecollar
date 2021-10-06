const  express = require('express');
const router = express.Router();
// const {verify} = require('../middleware/auth');
const membership = require('../controllers/membership.controllers');

router.post("/create", membership.create);
router.put("/update/:id", membership.updateById);
router.delete("/del/:id", membership.deleteById);
router.get("/list/:id", membership.getById);
router.get("/list", membership.getAll);
router.put("/updateStatus/:id",membership.updateStatusById);
module.exports = router;