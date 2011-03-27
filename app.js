
/**
 * Module dependencies.
 */

/* TJ Holoway Chuck is my hero */

var sys = require('sys');
var ejs = require('ejs');
var express = require('express');
var mongoose = require('mongoose');
var form = require('connect-form');
var crypto = require('crypto');
var models = require('./models');

var db,
    User,
    List,
    Recipe,
    FeedElement,
    Vote;

var app = module.exports = express.createServer(
  express.cookieParser(),
  express.session({secret: 'nerd culture reference'}),
  form({ keepExtensions: true, uploadDir: "/home/mason/wokfly/public/_/img/" })
);

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
  app.Recipe = Recipe = mongoose.model('Recipe');
  app.User = User = mongoose.model('User');
  app.List = List = mongoose.model('List');
  app.FeedElement = FeedElement = mongoose.model('FeedElement');
  app.Vote = Vote = mongoose.model('Vote');
  db = mongoose.connect('mongodb://localhost/wokfly');
});

// Authentication

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function authenticate(name, pass, fn)
{
  User.findOne({name: name, password: pass}, function (err, cursor){
    if (err || !cursor)
      fn(new Error("Invalid username or password!"));
    else
      return fn(null, cursor);
  });
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  }
  else
  {
    res.redirect('/login');
  }
}

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/login', function(req, res){
  if (req.session.user) {
    res.redirect('/');
  }
  else
  {
    res.render('login', {attempts: 0, error: null});
  }
});

app.post('/login', function(req, res) {
  if (req.session.user) {
    res.redirect('/');
  }

  if (!req.body.username || !req.body.password)
  {
    res.render('login', {attempts: 1, error: null});
  }
  else
  {

  authenticate(req.body.username, md5(req.body.password), function(err, result){
    if (result) {
      console.log(sys.inspect(result));
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function(){
        // Store the user's primary key 
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = result;
        res.redirect('/');
      });
    }
    else
    {
      res.render('login', {attempts: 1, error: null});
    }
  });

  }
});

app.post('/register', function(req, res) {
  if (!req.body.username)
  {
    res.render('login', {attempts: 0, error: "Username cannot be blank"});
  }
  else if(!req.body.password || req.body.password.length < 6)
  {
    res.render('login', {attempts: 0, error: "Password cannot less than 6 characters"});
  }
  else if(req.body.password != req.body.password2)
  {
    res.render('login', {attempts: 0, error: "Password and confirmation password must match"});
  }
  else
  {
    User.find({name: req.body.username}, function(err, cursor){
      if (err)
      {
        res.render('login', {attempts: 0, error: "Error " + err.message});
      }
      else if (!cursor)
      {
        var acc = new User({ 
          name: req.body.username, 
          password: md5(req.body.password),
          image: req.body.imageid
        });
        acc.save();

        var fd = new FeedElement({
          category: "New Member",
          ownerid: acc._id,
          owner: acc.name,
          ownerimg: acc.image,
          event: "Welcome our new member to the Wokfly community!"
        });
        fd.save();

        req.session.regenerate(function(){
          req.session.user = acc;
          res.redirect('/');
        });
      }
      else
      {
        res.render('login', {attempts: 0, error: "Sorry, that username is taken!"});
      }
    });
  }
});

// Routes

require('./routes/ajax.js')(app);
require('./routes/recipe.js')(app);

app.get('/list/add', function(req, res, next){
  res.render('listedit', {
      action: "",
      listname: "",
      items: [],
      enedit: true,
      user: req.session.user
  });
});

app.post('/list/save', function(req, res, next){
  var l = new List();
  var ing = new Array();

  l.name = req.body.title;
  l.owner = req.session.user._id;
  l.items = req.body.pipedlist.split("|");

  l.save();

  var fd = new FeedElement({
    category: "List Created",
    ownerid: req.session.user._id,
    owner: req.session.user.name,
    ownerimg: req.session.user.image,
    event: "A new list has been created: " + l.name
  });
  fd.save();

  req.flash('List saved!');
  res.redirect('/list');
});

app.get('/list/:id', function(req, res, next){
  List.findById(req.params.id, function(err, l){
    if(!l)
    {
      console.log("Could not find list " + req.params.id);
      res.redirect('/list');
    }
    else
    {
      res.render('listedit', {
        action: "/"+l._id,
        listname: l.name,
        items: l.items,
        enedit: (req.session.user._id == l.owner) ? true : false,
        user: req.session.user
      });
    }
  });
});

app.get('/list', function(req, res, next){
  List.find({owner: req.session.user._id}, function(err, cursor){
    if(err)
      console.log("error on list display for user " + req.session.user.name + ": " + err.message);
    res.render('lists', {
        lists: cursor,
        user: req.session.user
    });
  });
});

app.get('/', restrict, function(req, res){
  FeedElement.find({}, [], { limit: 5 }, function(err, feeds){
    if (err)
      console.log("Feed error: "+ err.message);

    Recipe.find({}, function (err, cursor) {
      if (err)
        console.log("Error on find all" + err);

      res.render('index', {
        recipes: cursor,
        feed: feeds,
        user: req.session.user
      });
    });
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
