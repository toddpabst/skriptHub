var mongoose = require('mongoose');

// Defining script schema for skriptHub DB

var scriptSchema = mongoose.Schema({

	name		: {type: String},
	category	: {type: String},

});

module.exports = mongoose.model('Script', scriptSchema);