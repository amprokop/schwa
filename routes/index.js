var fs = require('fs'),
    path = require('path'),
    handlebars = require('handlebars');

exports.logIn = function(req,res){
  fs.createReadStream(path.join('./views/signin.html')).pipe(res);
};

exports.logOut = function(req, res){
  req.logout();
  res.redirect('/');
};
