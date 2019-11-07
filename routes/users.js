const debug = require('debug')('geo:user');
var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../models/user');
const utils = require('./utils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';

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
router.post('/', utils.authenticate, function(req, res, next) {
  bcrypt.hash(req.body.password, 10, function(err, hashedPassword) {
    if (err) {
      return next(err);
    }

    // Create a new document from the JSON in the request body
    const newUser = new User(req.body);
    newUser.password = hashedPassword;
    // Save that document
    newUser.save(function(err, savedUser) {
      if (err) {
        return next(err);
      }
      // Send the saved document in the response
      res.send(savedUser);
    });
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
router.delete('/:id', loadUserFromParamsMiddleware, utils.authenticate, function(req, res, next) {
    req.user.remove(function(err) {
      if (err) {
        return next(err);
      }

      debug(`Deleted user "${req.user.username}"`);
      res.sendStatus(204);
    });
  });

/* Register a user */
router.post('/register', function(req, res, next){
  User.find({ username: req.body.username })
  .exec()
  .then(user => {
    if (user.length >= 1) {
      return res.status(409).json({
        message: "Username already exists"
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
          return next(err);
        } else {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            username: req.body.username,
            password: hashedPassword
          });
          user.save(function(err, savedUser) {
            if (err) {
              return next(err);
            }
            debug(`User "${savedUser.username}" created`);
            res.send(savedUser);
          });
        }
      });
    }
  });
});

/* Authenticate a user */
router.post('/login', function(req, res, next) {
  User.findOne({ username: req.body.username }).exec(function(err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return res.sendStatus(401);
    }
    bcrypt.compare(req.body.password, user.password, function(err, valid) {
      if (err) {
        return next(err);
      } else if (!valid) {
        return res.sendStatus(401);
      }
      const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
      const claims = { sub: user._id.toString(), exp: exp };
      jwt.sign(claims, secretKey, function(err, token) {
        if (err) { return next(err); }
        res.send({ token: token }); // Send the token to the client.
      });
    });
  })
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
