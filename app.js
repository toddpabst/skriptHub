// Requires \\
var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/skripthubDB') //name of DB

// Create Express App Object \\
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(_dirname + '/public'));

// Routes \\
var heroCtrl = require('./controllers/scriptCtrl')

app.get('/', function(req, res){
	res.sendFile('/') ??????????????
})