//Presently, your Chrome extension links to localhost:8080 for its popup. Must change in the build! Don't spend hours figuring this out.


var express = require('express');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var handlebars = require('handlebars');
var consolidate = require('consolidate');
var path = require('path');
var passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

app.configure( function(){
  app.use(express.bodyParser());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.cookieParser());
  app.use('/public', express.static(__dirname + '/public'));
  app.set('views', __dirname + '/');
  app.set('view engine', 'handlebars');
  app.set('view options', {layout: false});
});





//AUTHENTICATION CONFIG

passport.use(new FacebookStrategy({
    clientID: 751841161508795,
    clientSecret: 'cf5bf14d9607347dcb7f5fe9dee2dc6c',
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    User.findOne({'accounts.uid': profile.id, 'accounts.provider':'facebook'}, function(err, existingUser) {
      if(existingUser){
        console.log("Existing user: " + existingUser.firstname + " "  + existingUser.lastname + "found and logged in." );
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








//DATABASE SETUP

mongoose.connect('mongodb://localhost/flshr');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback(){
  console.log('successfully connected to mongo!');
});

var cardSchema = mongoose.Schema({
  front: String,
  back: String,
  deckname: String,
  URL: String,
  _creator: {type: Schema.Types.ObjectId, ref: 'User'}//,
  // decks: [{type: Schema.Types.ObjectId, ref: 'Deck'}]
  //REMOVED FOR NOW: is it necessary for the card to have  a reference to its containing deck?
  //the problem is--when we make a new card, if we want to save a reference to the deck we would...
  // first have to find the deck or make a new one, then save its id
  //THEN make the card
  //THEN return to the deck and save the card's ID.
  //this costs us three trips to the server.. is there a way to streamline this process?
});

var superMemo = mongoose.Schema({
  _cardid: {type: Schema.Types.ObjectId, ref: 'Card'},
  _userid: {type: Schema.Types.ObjectId, ref: 'User'},
  interval: Number,
  count: Number
});
//Not used yet----- need to implement user authentication first.

var userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  accounts: [],
  decks: [{type: Schema.Types.ObjectId, ref: 'Deck'}]
});

var deckSchema = mongoose.Schema({
  deckname: String,
  cards: [{type: Schema.Types.ObjectId, ref: 'Card' }],
  _creator: [{type: Schema.Types.ObjectId, ref: 'User'}]
});


var User = mongoose.model('User', userSchema);
var Card = mongoose.model('Card', cardSchema);
var Deck = mongoose.model('Deck', deckSchema);








//AUTHENTICATION ROUTES

app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/return', passport.authenticate('google', { successRedirect: '/index',
                                failureRedirect: '/'}));

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/index',
                                      failureRedirect: '/' }));

app.get('/popup/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/popup/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/chrome',
                                      failureRedirect: '/' }));










//APP ROUTES

app.post('/chrome', function(req,res){
  console.log('posted to /');

  var card = new Card({front: req.body.front, back: req.body.back, deckname:req.body.deckname});
  card.save(function(err, card){
    if (err){
      console.log(err);
    } else {
      console.log("New card created: " + card);
    }
  });
//GOAL: add user to card

  Deck.findOne({deckname:req.body.deck}, function(err,deck){
    if(deck){
      console.log('adding to existing deck: ' + deck.deckname);
      deck.cards.push(card._id);
      console.log(deck.cards);
      deck.save();
      console.log('now the existing deck is:' + deck);
    } else {
      var newDeck = new Deck({deckname:req.body.deck});
      console.log('new deck created with name: ' + newDeck.deckname);
      newDeck.cards.push(card._id);
      newDeck.save(function(err,deck){
        if (err){
          console.log(err);
        } else {
          console.log("New deck created: " + deck);
        }
      });
    }
  });
//add _creator to deck
  console.log(card.front, card.back);
  res.send(req.body.self);
});

app.get('/', function(req,res){
  fs.createReadStream(path.join(__dirname + '/signin.html')).pipe(res);
});

app.get('/chrome/new_card/', function(req,res){
  fs.createReadStream(path.join(__dirname + '/chrome.html')).pipe(res);
});


app.get('/chrome/', function(req,res){
  fs.createReadStream(path.join(__dirname + '/chrome.html')).pipe(res);
});

app.get('/chrome/new_card/*', function(req,res){
    var query = url.parse(req.url).query;
    if(query){
      var text = querystring.parse(query).text;
      console.log(querystring.parse(query).text);
    }
  fs.createReadStream(path.join(__dirname + '/chrome.html')).pipe(res);
});


app.get('/index', function(req,res){
  fs.createReadStream(path.join(__dirname + '/index.html')).pipe(res);
});

app.get('/deck', function(req, res){
  Card.find(function(err, cards){
    res.send(cards);
  });
});

app.get('/decks', function(req, res){
  Deck.find(function(err, decks){
    res.send(decks);
  });
});

app.get('/decks/*', function(req, res){
  // res.send('searching for deck with id: ' + req.params[0])
  var deckID = req.params[0];
  Deck.findOne({_id: deckID})
    .populate('cards')
    .exec(function(err, deck){
      if (err) {
        console.log('there was an error', err, deck);
      } else {
        res.send(deck.cards);
      }
    });
});






app.listen(8080);
console.log('express app listening on 8080.....');




