//TODO: add--deleting cards
//on get for new card, lookup the selected text
//TODO: There is a high confidence that your text is in spanish. Try to translate?
//Presently, your Chrome extension links to localhost:8080 for its popup. Must change in the build! Don't spend hours figuring this out.
//The extension's logout button is broken. When logging out and signing back in through the extension, you're redirected to the index page


var express = require('express');
var routes = require('./routes')
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var helpers = require('./helpers')
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var handlebars = require('handlebars');
var consolidate = require('consolidate');
var path = require('path');
var passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;
var keys = require('./keys.js');
var Shred = require("shred");
var shred = new Shred();

var app = express();

// app.use(function, req, res, next){
//   req.db = {};
  // req.db.tasks = db.collection('tasks')
// }

// var db = require('./mongoose'); 


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

app.get('/', routes.logIn)
app.get('/logout', routes.logOut)


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
app.post('/chrome/translate', extension.translateInputAndReturnPopup)




app.listen(8080);
console.log('This ya boy BIG EXPRESS.JS we listenin on 8080 nahmean?');


