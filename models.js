/* models.js to define database schema */
/* Code based on github.com/alexyoung/nodepad/model.js */
/* Mason Blier 2011 */

function defineModels(mongoose, fn) {
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

	/** 
	  * Model: Ingredient
	  */
	Ingredient = new Schema({
		'name'			: {type: String, index: true },
		'brand'			: String
	});

	/**
	  * Model: Recipe
	  */
	Recipe = new Schema({
		'iid'			: { type: Number, index: true },
		'name'			: String,
		'points'		: Number,
		'tags'			: [String],
		'description'	: String,
		'ingredients'	: [Ingredient]
	});

	mongoose.model('Ingredient', Ingredient);
	mongoose.model('Recipe', Recipe);

	fn();
}

exports.defineModels = defineModels;