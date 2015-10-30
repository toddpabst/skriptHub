var mongoose = require('mongoose');

// Defining script schema for skriptHub DB

var scriptSchema = mongoose.Schema({

	name		: {type: String},
	category	: {type: String},

});

var userSchema = mongoose.Schema({

	name		: {type: String, required: true},
	email		: {type: String, required: true},
	password	: {type: String, required: true},
	favorites	: {type: Array},
	useCase		: {type: Array},
})

var Script = mongoose.model('Script', scriptSchema);
var User = mongoose.model('User', userSchema)

module.exports = {Script: Script, User: User}