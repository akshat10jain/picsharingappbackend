const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require("../controllers/user");


router.post("/signup", userController.validateAuthCredentials, userController.signUp);
router.post("/signin", userController.validateAuthCredentials, userController.signIn);
router.post("/forgotpassword", userController.forgotPassword);
router.post("/resetpassword", userController.resetPassword);

module.exports = router;
