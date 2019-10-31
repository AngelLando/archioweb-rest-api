const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for users
const thumbnailSchema = new Schema({
  title: String,
  img: { data: Buffer, contentType: String },
  latitude: Number,
  longitude: Number,
  created_at: { type: Date, default: Date.now }
});
// Create the model from the schema and export it
module.exports = mongoose.model('Thumbnail', thumbnailSchema);