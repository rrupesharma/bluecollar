const  express = require('express');
const router = express.Router();
// const {verify} = require('../middleware/auth');
const membership_feature = require('../controllers/membership_feature.controllers');

router.post("/create", membership_feature.create);
router.put("/update/:id", membership_feature.updateById);
router.delete("/del/:id", membership_feature.deleteById);
router.get("/list/:id", membership_feature.getById);
router.get("/list", membership_feature.getAll);
router.put("/updateStatus/:id",membership_feature.updateStatusById);

module.exports = router;