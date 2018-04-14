var express = require('express');
var router = express.Router();
const userController = require("../controllers/user");
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.json({hello:'hello'})
// });

router.get('/', userController.homepage )

module.exports = router;
