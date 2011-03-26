
/**
 * Module dependencies.
 */

var ejs = require('ejs');
var express = require('express');
var mongoose = require('mongoose');
var models = require('./models');

var db,
    Ingredient,
    Recipe;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Database

models.defineModels(mongoose, function() {
  app.Ingredient = Ingredient = mongoose.model('Ingredient');
  app.Recipe = Recipe = mongoose.model('Recipe');
  db = mongoose.connect('mongodb://localhost/wokfly');
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    recipes: Recipe.find().sort({iid: -1}).limit(20)
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
