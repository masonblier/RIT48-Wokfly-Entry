/**
 * Ajax utility routes
 */

var form = require('connect-form');
var path = require('path');

module.exports = function(app){

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
      res.write('{ "imageid" : "'+path.basename(files.image.path)+'" }');
      res.end();
    }
  });

  // We can add listeners for several form
  // events such as "progress"
  req.form.on('progress', function(bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    process.stdout.write('Uploading: %' + percent + '\r');
  });
});

};