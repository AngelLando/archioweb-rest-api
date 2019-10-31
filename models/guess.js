const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for users
const guessSchema = new Schema({
  thumbnail_id: Schema.Types.ObjectId,
  user_id: Schema.Types.ObjectId,
  latitude: Number,
  longitude: Number,
  score: Number,
  created_at: { type: Date, default: Date.now },

});
// Create the model from the schema and export it
module.exports = mongoose.model('Guess', guessSchema);