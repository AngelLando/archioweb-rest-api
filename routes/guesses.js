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

function loadGuessFromParamsMiddleware(req, res, next) {

  const guessId = req.params.id;
  if (!ObjectId.isValid(guessId)) {
    return movieNotFound(res, guessId);
  }

  let query = Guess.findById(guessId)

  query.exec(function (err, guess) {
    if (err) {
      return next(err);
    } else if (!guess) {
      return guessNotFound(res, guessId);
    }

    req.guess = guess;
    next();
  });
}

function guessNotFound(res, guessId) {
  return res.status(404).type('text').send(`No guess found with ID ${guessId}`);
}

/*DELETE guess*/
router.delete('/:id', loadGuessFromParamsMiddleware, function (req, res, next) {
  req.guess.remove(function (err) {
    if (err) {
      return next(err);
    }

    debug(`Deleted guess "${req.guess.created_at}"`);
    res.sendStatus(204);
  });
});

module.exports = router;