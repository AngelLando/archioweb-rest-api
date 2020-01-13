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
  city:{
    type:String,
    required:true
  },
  country:{
    type:String,
    required:true
  },
  password: {
    type: String,
    required: true,
  },
  created_at: { type: Date, default: Date.now }
});

/* Hiding the password hash from API responses */
userSchema.set('toJSON', {
  transform: transformJsonUser
});

function transformJsonUser(doc, json, options) {
 // Remove the hashed password from the generated JSON.
 delete json.password;
 return json;
}

/**
 * Given a name, calls the callback function with true if no user exists with that username
 * (or the only user that exists is the same as the user being validated).
 */
function validateUsernameUniqueness(value) {
  return this.constructor.findOne().where('username').equals(value).exec().then((existingUser) => {
    return !existingUser || existingUser._id.equals(this._id);
  });
}

// Create the model from the schema and export it
module.exports = mongoose.model('User', userSchema);