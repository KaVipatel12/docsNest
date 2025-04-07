const express = require('express'); 
const router = express.Router(); 
const authController = require("../controllers/authController"); 
const { validate } = require('../middlewares/validateMiddleWare');
const registerSchema = require('../validators/authValidator');

router.route("/register").post( validate(registerSchema) ,authController.register)
router.route("/login").post(authController.login)

module.exports = router; 