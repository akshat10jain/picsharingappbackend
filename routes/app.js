var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get('/test', function (req, res) {
  res.send(`Your user id is: ${req.user._id}`)
});

module.exports = router;
