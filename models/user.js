const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for users
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: [3, 'Name is too short, 3 characters minimum.'],
    maxlength: [20, 'Name is too long, 20 characters maximum.']
  },
  password: {
    type: String,
    required: true,
  },
  created_at: { type: Date, default: Date.now }
});
// Create the model from the schema and export it
module.exports = mongoose.model('User', userSchema);