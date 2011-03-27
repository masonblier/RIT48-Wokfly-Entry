/* models.js to define database schema */
/* Code based on github.com/alexyoung/nodepad/model.js */
/* Mason Blier 2011 */

function defineModels(mongoose, fn) {
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

	/**
	  * Model: User
	  */
	User = new Schema({
		'name'			: { type: String, unique: true },
		'password'		: String
	});

	/**
	  * Model: Recipe
	  */
	Recipe = new Schema({
		'name'			: String,
		'author'		: String,
		'lasteditor'	: String,
		'image'			: String,
		'points'		: Number,
		'tags'			: [String],
		'description'	: String,
		'ingredients'	: [String],
		'document'		: String
	});

	mongoose.model('User', User)
	mongoose.model('Recipe', Recipe);

	fn();
}

exports.defineModels = defineModels;