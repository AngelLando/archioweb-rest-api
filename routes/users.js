const debug = require('debug')('geo:user');
var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../models/user');
const utils = require('./utils');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find().sort('created_at').exec(function(err, users) {
    if (err) {
      return next(err);
    }
    res.send(users);
  });
});

/* GET retrieve a user */
router.get('/:id', loadUserFromParamsMiddleware, function(req, res, next) {
    res.send({
      ...req.user.toJSON()
    });
  });

/* POST new user */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newUser = new User(req.body);
  // Save that document
  newUser.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedUser);
  });
});

/* PATCH a user */
router.patch('/:id', utils.requireJson, loadUserFromParamsMiddleware, function(req, res, next) {

  // Update properties present in the request body
  if (req.body.username !== undefined) {
    req.user.username = req.body.username;
  }
  if (req.body.password !== undefined) {
    req.user.password = req.body.password;
  }

  req.user.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }

    debug(`Updated user "${savedUser.username}"`);
    res.send(savedUser);
  });
});

/* DELETE a user */
router.delete('/:id', loadUserFromParamsMiddleware, function(req, res, next) {
    req.user.remove(function(err) {
      if (err) {
        return next(err);
      }

      debug(`Deleted user "${req.user.username}"`);
      res.sendStatus(204);
    });
  });

/**
 * Middleware that loads the user corresponding to the ID in the URL path.
 * Responds with 404 Not Found if the ID is not valid or the user doesn't exist.
 */
function loadUserFromParamsMiddleware(req, res, next) {

  const userId = req.params.id;
  if (!ObjectId.isValid(userId)) {
    return userNotFound(res, userId);
  }

  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return userNotFound(res, userId);
    }

    req.user = user;
    next();
  });
}

/**
 * Responds with 404 Not Found and a message indicating that the person with the specified ID was not found.
 */
function userNotFound(res, userId) {
  return res.status(404).type('text').send(`No user found with ID ${userId}`);
}

module.exports = router;
