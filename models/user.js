const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for users
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: [3, 'Name is too short, 3 characters minimum.'],
    maxlength: [20, 'Name is too long, 20 characters maximum.'],
    unique: true,
    validate:
      // Manually validate uniqueness to send a "pretty" validation error
      // rather than a MongoDB duplicate key error
      [{
        validator: validateUsernameUniqueness,
        message:'Username {VALUE} already exists'
      }],
  },
  password: {
    type: String,
    required: true,
  },
  created_at: { type: Date, default: Date.now }
});

/**
 * Given a name, calls the callback function with true if no person exists with that name
 * (or the only person that exists is the same as the person being validated).
 */
function validateUsernameUniqueness(value) {
  return this.constructor.findOne().where('username').equals(value).exec().then((existingPerson) => {
    return !existingPerson || existingPerson._id.equals(this._id);
  });
}

// Create the model from the schema and export it
module.exports = mongoose.model('User', userSchema);