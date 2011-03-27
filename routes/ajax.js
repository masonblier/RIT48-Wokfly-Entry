/**
 * Ajax utility routes
 */

var form = require('connect-form');
var path = require('path');



module.exports = function(app){

var Recipe = app.Recipe;
var User = app.User;
var Vote = app.Vote;

/* Recipe get vote state */
app.get('/ajax/vote/:id', function(req, res){
  Recipe.findById(req.params.id, function(err, r){
    if (r)
    {
      Vote.count({recipe: r._id}, function(err, d){
        Vote.findOne({recipe: r._id, voter: req.session.user._id}, function(err, k){
          if(k)
          {
            var data = { id: req.params.id, votes: d, state: true };
            res.send(JSON.stringify(data));
          }
          else
          {
            var data = { id: req.params.id, votes: d, state: false };
            res.send(JSON.stringify(data));
          }
        });
      });
    }
    else
    {
      var data = { id: req.params.id, votes: 0, state: false };
      res.send(JSON.stringify(data));
    }
  });
});

/* Recipe voting */
app.get('/ajax/upvote/:id', function(req, res){
  Recipe.findById(req.params.id, function(err, r){
    if (r)
    {
      User.findOne({name: r.author}, function(err, a){
        if (!a)
        {
          console.log("Author for recipe "+r.name+" was not found!");
        }
        else
        {
          Vote.findOne({recipe: r._id, voter: req.session.user._id}, function(err, k){
            if (!k)
            {
              var v = new Vote();
              v.recipe = r._id;
              v.author = a._id;
              v.voter = req.session.user._id;
              v.save();
            }
            else
            {
              k.remove();
            }
          });
        }
      });
    }

    res.end();
  });
});

app.post('/ajax/image', function(req, res){
  // connect-form adds the req.form object
  // we can (optionally) define onComplete, passing
  // the exception (if any) fields parsed, and files parsed
  req.form.complete(function(err, fields, files){
    if (err) {
      console.log('image upload error: ' + err.message);
      res.write('{ "err": "' + err.message + '" }');
      res.end();
    } else {
      var data = {imageid: path.basename(files.image.path), imagename: files.image.filename};
      res.send(JSON.stringify(data));
    }
  });

  // We can add listeners for several form
  // events such as "progress"
 /* req.form.on('progress', function(bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    process.stdout.write('Uploading: %' + percent + '\r');
  });*/
});

};