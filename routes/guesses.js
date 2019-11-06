var express = require('express');
var router = express.Router();
const Guess = require('../models/guess');
/* GET guesses listing. */
router.get('/', function(req, res, next) {
  Guess.find().sort('created_at').exec(function(err, guesses) {
    if (err) {
      return next(err);
    }
    res.send(guesses);
  });
});

/* POST new guess */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newGuess = new Guess(req.body);
  // Save that document
  newGuess.save(function(err, savedGuess) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedGuess);
  });
});

module.exports = router;