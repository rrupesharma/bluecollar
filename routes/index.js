const express = require('express');
const membership = require('./membership.routes');
const membership_feature = require('./membership_feature.routes');
const router = express.Router();

router.use('/membership',membership);
router.use('/membership_feature',membership_feature);
module.exports = router;