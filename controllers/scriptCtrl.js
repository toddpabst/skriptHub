// Include our Model
var Script = require('../models/scripts');

// Define Route Handlers

// Create a NEW Script
var createScript = function(req, res){
	// Data from a POST request lives in req.body

	var newScript = new Script({
		name		:req.body.name,
		category	:req.body.category,

	})

	newScript.save(function(err, doc){
		res.send(doc)

	})

}

var findScripts = function(req, res){
	console.log('REQ PARAMS', req.params)
	if (req.params.scriptName){
		Script.findOne({name : req.params.heroName}, function(err, doc){
				res.send(doc)
		})
	}
	else{

		Script.find({}), function(err, docs){
				res.send(docs)
				//scripts = docs
		})
	}
	//res.send(scripts)

}

module.exports = {
	createScript : createScript,
	findScripts : findScripts,
}