/**
 * Recipe routes
 */

var sys = require('sys');

module.exports = function(app){

Recipe = app.Recipe;

app.get('/recipe/new', function(req, res){
  res.render('recipeadd', {});
});

app.post('/recipe/save', function(req, res){
  var r = new Recipe();
  var ing = new Array();

  r.name = req.body.title;
  r.points = 0;
  r.author = req.session.user.name;
  r.tags = req.body.tags.split(",");
  r.image = req.body.imageid;
  r.description = req.body.description;
  r.ingredients = req.body.ingredientsjson.split("|");
  r.document = req.body.document;

  r.save();

  req.flash('Recipe saved!');
  res.redirect('/recipe/' + r._id);
});

app.post('/recipe/save/:id', function(req, res){
  Recipe.findById(req.params.id, function(err, r){
    if (!r)
      return next(new Error('Could not save recipe, existing entry not found!'));
    else
    {
      r.name = req.body.title;
      r.lasteditor = req.session.user.name;
      r.tags = req.body.tags.split(",");
      r.description = req.body.description;
      r.image = req.body.imageid;
      r.document = req.body.document;

      r.save();

      req.flash('Edit saved!');
      res.redirect('/recipe/' + req.params.id);
    }
  });
});

app.get('/recipe/edit/:id', function(req, res){
  Recipe.findById(req.params.id, function(err, r){
    if (!r)
      return next(new Error('Could not save recipe, existing entry not found!'));
    else
    {
      var imgurl = "/images/empty.png";
      if (r.image)
        imgurl = "/_/img/" + r.image;

      res.render('recipeedit', {
        r: r,
        image: imgurl
      });
    }
  });
});

app.get('/recipe/:id', function(req, res){
  Recipe.findById(req.params.id, function(err, r){
    if (err)
      console.log("Error in fetch recipe: "+ err);
    if (!r)
      console.log("Cannot fetch recipe " + req.params.id);
    
    res.render('recipe', {
      r: r,
      instructions: require('markdown').markdown.toHTML(r.document)
    });
  });
});

};