const express = require('express');
const membership = require('./membership.routes');
const membership_feature = require('./membership_feature.routes');
const product = require('./product.routes');
const membership_reward_rule = require('./membership_reward_rule.routes');
const router = express.Router();

router.use('/membership',membership);
router.use('/membership_feature',membership_feature);
router.use('/product',product);
router.use('/membership_reward_rule',membership_reward_rule);
module.exports = router;