const User = require('../models/user');
const Thumbnail = require('../models/thumbnail');
const Guess = require('../models/guess');

exports.cleanUpDatabase = async function() {
  await Promise.all([
    User.deleteMany(),
    Thumbnail.deleteMany(),
    Guess.deleteMany()
  ]);
};