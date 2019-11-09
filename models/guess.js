const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Thumbnail = require('../models/thumbnail');
const User = require('../models/user');
const debug = require('debug')('geo:guesses');


// Define the schema for users
const guessSchema = new Schema({
	thumbnail_id:{
		type: Schema.Types.ObjectId,
		required: true,
		validate:{
			validator: validateThumbnailDependency,
			message: '{VALUE} doesnt have a linked existing thumbnail'
		}
	} ,
	user_id:{
		type: Schema.Types.ObjectId,
		required: true,
		validate:{
			validator: validateUserDependency,
			message: '{VALUE} doesnt have a linked existing user or you are trying to comment your own post.'
		}
	} ,
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
		required: true,
		min: [0, 'Score trop bas'],
	},
	created_at: { type: Date, default: Date.now },

});

// Create a geospatial index on the location property.
guessSchema.index({ location: '2dsphere' });

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
	return Array.isArray(value) && value.length >= 2 && value.length <= 3 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90;
}

function validateThumbnailDependency (value){
	//requête pour voir si l'ID est relié à qqchose
	return Thumbnail.findOne({ _id: value }).select("id");

}
function validateUserDependency (value){
			return Thumbnail.findOne().where('_id').equals(this.thumbnail_id).exec().then((existingThumbnail)=>{
				return !existingThumbnail.user_id.equals(this.user_id);
			});

}
// Create the model from the schema and export it
module.exports = mongoose.model('Guess', guessSchema);
