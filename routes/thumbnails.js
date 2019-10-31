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
module.exports = router;