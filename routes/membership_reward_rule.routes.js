const  express = require('express');
const router = express.Router();
// const {verify} = require('../middleware/auth');
const membershipRewardRule = require('../controllers/membership_reward_rule.controllers');

router.post("/create", membershipRewardRule.create);
router.put("/update/:id", membershipRewardRule.updateById);
router.delete("/del/:id", membershipRewardRule.deleteById);
router.get("/list/:id", membershipRewardRule.getById);
router.post("/list", membershipRewardRule.getAll);
router.put("/updateStatus/:id",membershipRewardRule.updateStatusById);
module.exports = router;