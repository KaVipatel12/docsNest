const express = require('express'); 
const router = express.Router(); 
const authController = require("../controllers/authController"); 
const { validate } = require('../middlewares/validateMiddleWare');
const registerSchema = require('../validators/authValidator');

router.route("/register").post( validate(registerSchema) ,authController.register)
router.route("/login").post(authController.login)
router.route("/sendotpemail").post( authController.sendOtpEmail)
router.route("/otpverification").post( authController.otpVerification)
router.route("/updatepassword").post( authController.newPassword)

module.exports = router; 