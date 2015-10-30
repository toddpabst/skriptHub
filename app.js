// Requires \\
var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/skripthubDB') //name of DB

var session = require('express-session');
var passport = require('passport');

// Create Express App Object \\
var app = express();

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Routes \\
var scriptCtrl = require('./controllers/scriptCtrl')

app.get('/', function(req, res){
	res.sendFile('/public/main.html', {root : './public'})    //Not sure about this... 
})

app.get('/script/:scriptName', function(req, res){
	res.sendFile('/public/main.html', {root : './public'})   //Or this...
})

// Script Routes
app.post('/api/scripts', scriptCtrl.createScript);
app.get('/api/scripts', scriptCtrl.findScripts);
app.get('/api/scripts/:scriptName', scriptCtrl.findScripts);

// Creating Server and Listening for Connections \\
var port = 3000
app.listen(port, function(){
	console.log('Server running on port ' + port);

});

// Passport