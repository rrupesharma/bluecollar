const express = require('express');
const membership = require('./membership.routes');
const router = express.Router();

router.use('/membership',membership);
module.exports = router;