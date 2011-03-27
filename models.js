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
		'password'		: String,
		'image'			: String,
	});

	/**
	  * Model: List
	  */
	List = new Schema({
		'name'			: String,
		'owner'			: ObjectId,
		'items'			: [String]
	});

	/**
	  * Model: Recipe
	  */
	Recipe = new Schema({
		'name'			: String,
		'author'		: String,
		'lasteditor'	: String,
		'image'			: { type: String, default: "empty.png" },
		'tags'			: [String],
		'description'	: String,
		'ingredients'	: [String],
		'document'		: String
	});

	/**
	  * Model: FeedElement
	  */
	FeedElement = new Schema({
		'category'		: String,
		'ownerid'		: ObjectId,
		'owner'			: String,
		'ownerimg'		: { type: String, default: "empty.png" },
		'event'			: String
	});

	/**
	  * Model: Vote
	  */
	Vote = new Schema({
		'recipe'		: ObjectId,
		'author'		: ObjectId,
		'voter'			: ObjectId
	});

	mongoose.model('List', List);
	mongoose.model('User', User);
	mongoose.model('Recipe', Recipe);
	mongoose.model('FeedElement', FeedElement);
	mongoose.model('Vote', Vote);

	fn();
}

exports.defineModels = defineModels;