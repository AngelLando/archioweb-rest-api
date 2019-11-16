const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Guess = require('../models/guess');
const User = require('../models/user');


// Define the schema for users
const thumbnailSchema = new Schema({
	title: String,
	user_id: {
		type: Schema.Types.ObjectId,
		required:true,
		validate: {
			validator: validateUserDependency,
				message: '{VALUE} doesnt have a linked existing user'
		}
	},
	img: {
		data: Buffer,
		contentType: String,
	},
  	location: {
	  	type: {
			type: String,
			required: true,
			enum: ['Point']
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
  	created_at: { type: Date, default: Date.now }
});

// Create a geospatial index on the location property.
thumbnailSchema.index({ location: '2dsphere' });

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
  return Array.isArray(value) && value.length >= 2 && value.length <= 3 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90;
}

function validateUserDependency (value){
	//requête pour voir si l'ID est relié à qqchose
	return User.findOne({ _id: value }).select("id");
}

// Create the model from the schema and export it
module.exports = mongoose.model('Thumbnail', thumbnailSchema);

