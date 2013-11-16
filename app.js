/*Hi code reviewer (Shawn?), here are a few questions/concerns I have.

app.js
--I'm storing the Mongoose models as global variables. Is this a very bad idea? How should I better organize it?
--I'm aware that the names of things need to be changed.

index.html
--is it better to strip out the templates and include them in seperate files?

Backbone generally
--Because I have to populate subfields to retrieve all the data I need, 
the result of my MongoDB query is a little messy.
Due to this, I can't use the built-in Backbone methods and it looks really bad. 
I can think of two ways to resolve this problem.
The first: Use Backbone.parse to chisel my data into the shape that I want it after I retrieve it from the server
The second: Manipulate it on the server and send it back better formatted.
Would you suggest either way? Or something else?


--I'm doing some data manipulation in the Views--that's where my spaced repitition algorithm currently lives.
Should it be moved to the model? Or on the backend? I'm not really sure what the main considerations in favor of
either would be.

Thanks for taking the time to look at this!
-Alex
*/




//TODO: add--deleting cards
//on get for new card, lookup the selected text
//TODO: There is a high confidence that your text is in spanish. Try to translate?
//Presently, your Chrome extension links to localhost:8080 for its popup. Must change in the build! Don't spend hours figuring this out.
//The extension's logout button is broken. When logging out and signing back in through the extension, you're redirected to the index page


var express = require('express');
var routes = require('./routes');
var index = require('./routes/index');
console.log(index);
var jogly = require('./routes/jogly');
console.log(jogly);
var extension = require('./routes/extension');
console.log(extension);
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var helpers = require('./helpers');
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

//DATABASE CONFIG

mongoose.connect('mongodb://localhost/flshr');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'there was an error when connecting to mongodb'));


var cardSchema = mongoose.Schema({
  front: String,
  back: String,
  deckname: String,
  URL: String,
  _creator: {type: Schema.Types.ObjectId, ref: 'User'}//,
});

var memoSchema = mongoose.Schema({
  _cardid: {type: Schema.Types.ObjectId, ref: 'Card'},
  _deckid: {type: Schema.Types.ObjectId, ref: 'Deck'},
  _userid: {type: Schema.Types.ObjectId, ref: 'User'},
  nextDate: Number, 
  prevDate: Number,
  interval: Number,
  repetitions: Number,
  EF: Number
});

var userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  accounts: [],
  decks: [{type: Schema.Types.ObjectId, ref: 'Deck'}],
  memos: [{type: Schema.Types.ObjectId, ref: 'Memo'}]
});

var deckSchema = mongoose.Schema({
  _creator: [{type: Schema.Types.ObjectId, ref: 'User'}],
  deckname: String,
  cards: [{type: Schema.Types.ObjectId, ref: 'Card' }],
  defaultLang: String,
  autoTranslate: Boolean,
  saveURL: Boolean,
});



User = mongoose.model('User', userSchema);
Card = mongoose.model('Card', cardSchema);
Deck = mongoose.model('Deck', deckSchema);
Memo = mongoose.model('Memo', memoSchema);




//AUTHENTICATION CONFIG

passport.use(new FacebookStrategy({
    clientID: 751841161508795,
    clientSecret: 'cf5bf14d9607347dcb7f5fe9dee2dc6c',
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    User.findOne({'accounts.uid': profile.id, 'accounts.provider':'facebook'}, function(err, existingUser) {
      if(existingUser){
        console.log("Existing user: " + existingUser.firstname + " "  + existingUser.lastname + " found and logged in." );
        done(null, existingUser);
      } else {
        var newUser = new User();
        var account = {provider: "facebook", uid: profile.id};
        newUser.accounts.push(account);
        newUser.firstname = profile.name.givenName;
        newUser.lastname = profile.name.familyName;
        newUser.email = "joe@123fakesite.com";
        newUser.save(function(err){
          if(err) {throw err;}
            console.log('New user: ' + newUser.firstname + ' ' + newUser.lastname + ' created and logged in!');
            done(null, newUser);
        });
      }
    });
  }
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
  User.findOne({_id: _id}, function(err,user){
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
app.post('/chrome/translate', extension.translateInputAndReturnPopup)




app.listen(8080);
console.log('This ya boy BIG EXPRESS.JS we listenin on 8080 nahmean?');


