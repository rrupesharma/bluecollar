const express = require('express');
const membership = require('./membership.routes');
const membership_feature = require('./membership_feature.routes');
const product = require('./product.routes');

const router = express.Router();

router.use('/membership',membership);
router.use('/membership_feature',membership_feature);
router.use('/product',product);
module.exports = router;