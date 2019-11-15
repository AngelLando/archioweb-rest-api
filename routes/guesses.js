var express = require('express');
var router = express.Router();
const Guess = require('../models/guess');
const mongoose = require('mongoose');
const debug = require('debug')('geo:guesses');
const ObjectId = mongoose.Types.ObjectId;

/* GET guesses listing. */
router.get('/', function(req, res, next) {
     let query = queryGuesses(req);
  query.exec(function(err, guesses) {
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

function queryGuesses(req){
  let query = Guess.find();

//permet de filtrer via ?scoredAtLeast=x
   if (!isNaN(req.query.scoredAtLeast)) {
    query = query.where('score').gte(req.query.scoredAtLeast);
  }

return query
}

module.exports = router;

/*--> ici on définit les chemins possibles avec les filtres si on en a mis*/