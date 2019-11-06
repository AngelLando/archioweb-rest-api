var express = require('express');
var router = express.Router();
const Thumbnail = require('../models/thumbnail');

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
  newThumbnail.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedThumbnail);
  });
});

module.exports = router;