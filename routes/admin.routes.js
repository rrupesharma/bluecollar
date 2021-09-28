const  express = require('express');
const router = express.Router();
const {verify} = require('../middleware/auth');
const admin = require('../controllers/admin.controllers');

router.post("/login", admin.login);
router.post("/reset-password", admin.setForgotPassword);
router.post("/forgot-password", admin.sendForgotPasswordLink);
router.post("/change-password",verify, admin.setChangePassword);
router.post("/check-verification", admin.checkVerificationLink);
router.post("/create",verify, admin.create);
router.put("/update",verify, admin.updateById);
router.delete("/del/:id",verify, admin.deleteById);
router.get("/list/:id",verify, admin.getById);
router.post("/list",verify, admin.getAll);


module.exports = router;