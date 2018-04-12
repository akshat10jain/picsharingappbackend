const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require("../controllers/user");


router.post("/signup", userController.validateAuthCredentials, userController.signUp);
router.post("/signin", userController.validateAuthCredentials, userController.signIn);


module.exports = router;
