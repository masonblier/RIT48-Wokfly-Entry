
/**
 * Module dependencies.
 */

var sys = require('sys');
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

app.get('/testdata', function(req, res){
  /*{
    'iid'         : 2,
    'name'        : "Choco-Pistachio Meringues",
    'points'      : 1,
    'tags'        : ["Cookies", "Dessert"],
    'description' : "Low-calorie meringue cookies are great for dieters who yearn for just a nibble of something sweet--like this recipe, which is made with pistachio nuts and dipped in chocolate."
  }*/

  var r1 = new Recipe();
  r1.iid = 1;
  r1.name =  "Grilled Chicken Panini";
  r1.points =  22;
  r1.tags =  ["Chicken", "Sandwich"];
  r1.description =  "Simple ingredients make for big flavor in this grilled chicken panini with pesto and provolone cheese.";

  r1.save(function () { res.redirect("/"); });
});

app.get('/', function(req, res){
  Recipe.find({}, function (err, recipes) {
    res.render('index', {
      recipes: recipes
    });
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
