var express = require('express');
var router = express.Router();
const User = require('../models/guess');
/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find().sort('created_at').exec(function(err, guesses) {
    if (err) {
      return next(err);
    }
    res.send(guesses);
  });
});
module.exports = router;