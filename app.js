//TODO: add--deleting cards
//on get for new card, lookup the selected text
//TODO: There is a high confidence that your text is in spanish. Try to translate?
//Presently, your Chrome extension links to localhost:8080 for its popup. Must change in the build! Don't spend hours figuring this out.
//The extension's logout button is broken. When logging out and signing back in through the extension, you're redirected to the index page


var express = require('express');
var routes = require('./routes');
var index = require('./routes/index');
var auth = require('./routes/auth');
console.log(index);
var jogly = require('./routes/jogly');
console.log(jogly);
var extension = require('./routes/extension');
console.log(extension);
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    mongoosedb = require('./mongoosedb')
var helpers = require('./helpers');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var handlebars = require('handlebars');
var consolidate = require('consolidate');
var path = require('path');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
var keys = require('./keys.js');
var Shred = require("shred");
var shred = new Shred();

var app = express();
var port = process.env.PORT || 5000;
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/flshr';


var domain;

if (process.env.MONGOHQ_URL){
  domain = 'http://sink-in.herokuapp.com/';
} else {
  domain = 'http://localhost:5050/'
}


app.configure( function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser(keys.facebook));
  app.use(express.cookieSession());
  app.use(passport.initialize());
  app.use(passport.session({secret: keys.facebook, cookie: {maxAge: 60000}}));
  app.use('/public', express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'handlebars');
  app.set('view options', {layout: false});
});



mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'there was an error when connecting to mongodb'));

//AUTHENTICATION CONFIG

passport.use(new FacebookStrategy({
    clientID: 751841161508795,
    clientSecret: 'cf5bf14d9607347dcb7f5fe9dee2dc6c',
    callbackURL: domain + 'auth/facebook/callback'
  },
  auth.authenticateFBUser
));

// passport.use(new GoogleStrategy({
//     returnURL: 'http://localhost:8080/auth/google/return',
//     realm: 'http://localhost:8080/index'
//   },
//   function(identifier, profile, done) {
//     User.findOrCreate({ passportId: identifier }, function(err, user) {
//       done(err, user);
//     });
//   }
// ));

passport.serializeUser(function(user,done){
  done(null, user._id);
});

passport.deserializeUser(function(_id, done){
  mongoosedb.User.findOne({_id: _id}, function(err,user){
    done(err,user);
  });
});

//AUTHENTICATION ROUTES

// app.get('/auth/google', passport.authenticate('google'));
// app.get('/auth/google/return', passport.authenticate('google', { successRedirect: '/index',
//                                 failureRedirect: '/'}));

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/index',
                                      failureRedirect: '/' }));
app.get('/extension/auth/facebook', passport.authenticate('facebook'));
app.get('/extension/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/chrome',
                                      failureRedirect: '/extension-login' }));

//INDEX ROUTES

app.get('/', index.logIn)
app.get('/logout', index.logOut)

//WEBAPP ROUTES

app.get('/index', jogly.startApp);
app.get('/deck', jogly.sendCards)
app.get('/decks', jogly.sendDecks)
app.get('/decks/*', jogly.sendMemosWithPopulatedCards)
app.get('/edit/*', jogly.sendDeckToEdit)
app.get('/user/decks', jogly.sendUserDecks)
app.post('/edit/card/*', jogly.updateCard)
//app.post('/edit/deck/*', jogly.updateDeck)
app.post('/decks/*', jogly.updateAlgorithmInfo)
app.delete('/delete/deck', jogly.deleteDeck)
//app.delete('/delete/card', jogly.deleteCard)

//EXTENSION ROUTES

app.get('/extension-login', extension.signIn)
app.get('/chrome/logout', extension.logOut)
app.get('/chrome', extension.openNewCardPopup)
app.get('/chrome/new_card/*', extension.openPopupWithSelectedText)
app.get('/newdeck', extension.openNewDeckPopup)
app.post('/new_deck', extension.addNewDeck)
app.post('/new_card', extension.addNewCard)
app.post('/new_card/translated', extension.addNewCardWithTranslations)
app.post('/chrome/translate/', extension.translateInputAndReturnPopup)





app.listen(port);
console.log('This ya boy BIG EXPRESS.JS we listenin on ' + port + ' nahmean?');


