const  express = require('express');
const router = express.Router();
// const {verify} = require('../middleware/auth');
const product = require('../controllers/product.controllers');

router.post("/create",product.create);
router.put("/update/:id",product.updateById);
router.delete("/del/:id",product.deleteById);
router.get("/list/:id",product.getById);
router.post("/list",product.getAll);
router.put("/updateStatus/:id",product.updateStatusById);
module.exports = router;