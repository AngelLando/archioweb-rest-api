const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for users
const guessSchema = new Schema({
  thumbnail_id: Schema.Types.ObjectId,
  user_id: Schema.Types.ObjectId,
  location: {
    type: {
      type: String,
      required: true,
      enum: [ 'Point' ]
    },
    coordinates: {
      type: [ Number ],
      required: true,
      validate: {
        validator: validateGeoJsonCoordinates,
        message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
      }
    }
  },
  score: {
  	type: Number,
  	min: [0, 'Score trop bas'],
  }
  created_at: { type: Date, default: Date.now },

});

// Create a geospatial index on the location property.
geolocatedSchema.index({ location: '2dsphere' });

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
  return Array.isArray(value) && value.length >= 2 && value.length <= 3 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90;
}
// Create the model from the schema and export it
module.exports = mongoose.model('Guess', guessSchema);

