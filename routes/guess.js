var express = require('express');
var router = express.Router();
const Guess = require('../models/guess');
/* GET users listing. */
router.get('/guesses', function(req, res, next) {
  Guess.find().sort('created_at').exec(function(err, guesses) {
    if (err) {
      return next(err);
    }
    res.send(guesses);
  });
});
module.exports = router;