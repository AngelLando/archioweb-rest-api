var express = require('express');
var router = express.Router();
const Thumbnail = require('../models/thumbnail');
const mongoose = require('mongoose');
const debug = require('debug')('demo:movies');
const ObjectId = mongoose.Types.ObjectId;

/* GET thumbnails listing. */
router.get('/', function(req, res, next) {
  Thumbnail.find().sort('created_at').exec(function(err, thumbnails) {
    if (err) {
      return next(err);
    }
    res.send(thumbnails);
  });
});

/* POST new thumbnail */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newThumbnail = new Thumbnail(req.body);
  // Save that document
  newThumbnail.save(function(err, savedThumbnail) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedThumbnail);
  });
});



/*GET one thumbnail*/
router.get('/:id', loadThumbnailFromParamsMiddleware, function (req, res, next) {
  res.send(req.thumbnail);
});

function loadThumbnailFromParamsMiddleware(req, res, next) {

  const thumbnailId = req.params.id;
  if (!ObjectId.isValid(thumbnailId)) {
    return movieNotFound(res, thumbnailId);
  }

  let query = Thumbnail.findById(thumbnailId)

  query.exec(function (err, thumbnail) {
    if (err) {
      return next(err);
    } else if (!thumbnail) {
      return thumbnailNotFound(res, thumbnailId);
    }

    req.thumbnail = thumbnail;
    next();
  });
}

function thumbnailNotFound(res, thumbnailId) {
  return res.status(404).type('text').send(`No thumbnail found with ID ${thumbnailId}`);
}

/*DELETE thumbnail*/
router.delete('/:id', loadThumbnailFromParamsMiddleware, function (req, res, next) {
  req.thumbnail.remove(function (err) {
    if (err) {
      return next(err);
    }

    debug(`Deleted thumbnail "${req.thumbnail.title}"`);
    res.sendStatus(204);
  });
});

module.exports = router;