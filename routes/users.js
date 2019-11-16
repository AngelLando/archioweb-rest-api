const config = require('../config');
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

/**
 * @api {post} /users Create a user
 * @apiName CreateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Registers a new user.
 *
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserValidationError
 * @apiSuccess (Response body) {String} id A unique identifier for the user generated by the server
 * 
 *
 * @apiExample Example
 *     POST /users HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "username": "JeanPaul",
 *       "password": "mypassword"
  *     }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://comem-archioweb-2019-2020-g.herokuapp.com/users/58b2926f5e1def0123e97281
 *
 *     
 *     {
 *       "_id": "5dc6b5f84080dc5e74951c66",
 *       "username": "bernard48",
 *       "created_at": "2019-11-09T13:19:37.568Z",
 *       "totalScore": 0,
 *       "maxScore": null,
 *       "averageScore": null
 *   },
 */

router.post('/', function(req, res, next) {
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
      res
        .status(201)
        .set('Location', `${config.baseUrl}/users/${savedUser._id}`)
        .send(savedUser);
    });
  });
});


/**
 * @api {get} /users/ List existing users
 * @apiName RetrieveUsers
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieves a paginated list of users with their respective scores and ordered by username (in alphabetical order).
 *
 * @apiUse UserInResponseBody
 * @apiUse Pagination
 *
 * @apiExample Example
 *     GET /users?page=2&pageSize=50 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: &lt;https://comem-archioweb-2019-2020-g.herokuapp.com/users?page=1&pageSize=50&gt;; rel="first prev"
 *
 *    [
 *   {
 *       "_id": "5dc6b5f84080dc5e74951c66",
 *       "username": "meme",
 *       "created_at": "2019-11-09T14:46:20.978Z",
 *       "totalScore": 120,
 *       "maxScore": 10,
 *       "averageScore": 10
 *   },
 *   {
 *       "_id": "5dc43646260fc7305c7ae3fd",
 *       "username": "pauline",
 *       "created_at": "2019-11-09T14:46:20.979Z",
 *       "totalScore": 48,
 *       "maxScore": 24,
 *       "averageScore": 24
 *   }
*]
 */

router.get('/', function(req, res, next) {

  const countQuery = queryUsers(req);
  countQuery.countDocuments(function(err, total) {
    if (err) {
      return next(err);
    }


    // Parse pagination parameters from URL query parameters.
    const { page, pageSize } = utils.getPaginationParameters(req);

    User.aggregate([
      {
        $lookup: {
          from: 'guesses',
          localField: '_id',
          foreignField: 'user_id',
          as: 'obtainedScores',
        }
      },
      {
        $unwind: {
          path:'$obtainedScores',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          username: { $first: '$username' },
          createdAt: { $first: '$createdAt' },
          totalScore: { $sum: '$obtainedScores.score' },
          maxScore: { $max: '$obtainedScores.score' },
          averageScore: { $avg: "$obtainedScores.score" }
        }
      },
      {
        $sort: {
          username: 1
        }
      },
      {
        $skip: (page - 1) * pageSize
      },
      {
        $limit: pageSize
      }
    ], (err, users) => {
      if (err) {
        return next(err);
      }

      utils.addLinkHeader('/api/users', page, pageSize, total, res);

      res.send(users.map(user => {

        // Transform the aggregated object into a Mongoose model.
        const serialized = new User(user).toJSON();

        // Add the aggregated property.
        serialized.totalScore = user.totalScore;
        serialized.maxScore = user.maxScore;
        serialized.averageScore = user.averageScore;

        return serialized;
      }));
    });
  });
});

/* GET retrieve a user */
router.get('/:id', loadUserFromParamsMiddleware, function(req, res, next) {
    res.send({
      ...req.user.toJSON()
    });
  });

/**
 * @api {get} /users/:id Retrieve a user
 * @apiName RetrieveUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieves one user.
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInResponseBody
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     GET /users/58b2926f5e1def0123e97bc0 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
        "_id": "5dc3ceebfe75680017e1555f",
        "username": "Biscotus",
        "created_at": "2019-11-16T09:04:57.040Z",
        "totalScore": 0,
        "maxScore": null,
        "averageScore": null
 *     }
 */

/* PATCH a user */

/**
 * @api {patch} /users/:id Partially update a user
 * @apiName PartiallyUpdateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Partially updates a user's data (only the properties found in the request body will be updated).
 * All properties are optional.
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserNotFoundError
 * @apiUse UserValidationError
 *
 * @apiExample Example
 *     PATCH /users/5dc3ceebfe75680017e1555f HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "username": "JohnDoe22"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
        "_id": "5dc3ceebfe75680017e1555f",
        "username": "JohnDoe22",
        "created_at": "2019-11-16T09:04:57.040Z",
        "totalScore": 65,
        "maxScore": 24,
        "averageScore": 16
 *     }
 */




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

/**
 * @api {delete} /users/:id Delete a user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes a user.
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     DELETE /users/58b2926f5e1def0123e97bc0 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
 */

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
 * Responds with 404 Not Found and a message indicating that the user with the specified ID was not found.
 */
function userNotFound(res, userId) {
  return res.status(404).type('text').send(`No user found with ID ${userId}`);
}

function queryUsers(req) {

  let query = User.find();
/** test filtre mais pas réussi
  if  (typeof(req.query.findByUsername) == 'string') {
    query=query.where('username').equals(req.query.findByUsername)
  }
**/


  return query;
}

/**
 * @apiDefine UserIdInUrlPath
 * @apiParam (URL path parameters) {String} id The unique identifier of the user to retrieve
 */

/**
 * @apiDefine UserInRequestBody
 * @apiParam (Request body) {String{3..20}} id The username of the user (must be unique)
 * @apiParam (Request body) {String} password The password of the user
 */

 /**
 * @apiDefine UserInResponseBody
 * @apiSuccess (Response body) {String} id The unique identifier of the user
 * @apiSuccess (Response body) {String} username The username of the user
 * @apiSuccess (Response body) {String} createdAt The date at which the user was registered
 * @apiSuccess (Response body) {Number} totalScore The total score of the user 
 * @apiSuccess (Response body) {Number} maxScore The maximum score of the user 
 * @apiSuccess (Response body) {Number} averageScore The average score of the user 
 */

 /**
 * @apiDefine UserNotFoundError
 *
 * @apiError {Object} 404/NotFound No user was found corresponding to the ID in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     No user found with ID 58b2926f5e1def0123e97bc0
 */

 /**
 * @apiDefine UserValidationError
 *
 * @apiError {Object} 422/UnprocessableEntity Some of the user's properties are invalid
 *
 * @apiErrorExample {json} 422 Unprocessable Entity
 *     HTTP/1.1 422 Unprocessable Entity
 *     Content-Type: application/json
 *
 *     {
 *       "message": "User validation failed",
 *       "errors": {
 *         "username": {
 *           "kind": "string",
 *           "message": "`foo` is not a valid string value for path `username`.",
 *           "name": "ValidatorError",
 *           "path": "username",
 *           "properties": "string":,
 *             "message": "`{VALUE}` is not a valid string value for path `{PATH}`.",
 *             "path": "username",
 *             "type": "string",
 *             "value": "foo"
 *           },
 *           "value": "foo"
 *         }
 *       }
 *     }
 */

 /**
 * @apiDefine Pagination
 * @apiParam (URL query parameters) {Number{1..}} [page] The page to retrieve (defaults to 1)
 * @apiParam (URL query parameters) {Number{1..100}} [pageSize] The number of elements to retrieve in one page (defaults to 100)
 * @apiSuccess (Response headers) {String} Link Links to the first, previous, next and last pages of the collection (if applicable)
 */



module.exports = router;