// Requires \\
var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/skripthubDB') //name of DB

// Auth Requires \\
var session = require('express-session');
var passport = require('passport');

var passportConfig = require('./config/passport'); // Load in our passport configuration that decides how passport actually runs and authenticates

// Create Express App Object \\
var app = express();

// Session Setup
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: false
}));

// Hook in passport to the middleware chain
app.use(passport.initialize());

// Hook in the passport session management into the middleware chain.
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes \\
var authenticationController = require('./controllers/authentication');

// Routes \\
var scriptCtrl = require('./controllers/scriptCtrl')

// Our get request for viewing the login page
app.get('/auth/login', authenticationController.login);

// Post received from submitting the login form
app.post('/auth/login', authenticationController.processLogin);

// Post received from submitting the signup form
app.post('/auth/signup', authenticationController.processSignup);

// Any requests to log out can be handled at this url
app.get('/auth/logout', authenticationController.logout);

// This route is designed to send back the logged in user (or undefined if they are NOT logged in)
app.get('/api/me', function(req, res){
	res.send(req.user)
})

// ***** IMPORTANT ***** //
// By including this middleware (defined in our config/passport.js module.exports),
// We can prevent unauthorized access to any route handler defined after this call
// to .use()
// app.use(passportConfig.ensureAuthenticated);

app.get('/', function(req, res){
	res.sendFile('/html/main.html', {root : './public'})    //Not sure about this... 
})

app.get('/script/:scriptName', function(req, res){
	res.sendFile('/html/main.html', {root : './public'})   //Or this...
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