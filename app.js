var express = require('express');
var mongoose = require('mongoose');
var fs = require('fs');
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
  console.log(__dirname + './public');
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
  back: String,//,
  deck: String
  //user:
  //collection: String,
  //source_URL: String,
  // reviews: Number,
  // pushed_up: Boolean,
  // pushed_down: Boolean,
  // created_at: { type: String, default: (new Date()).getTime() }
});

var userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  accounts: [],
  decks: []
});

var deckSchema = mongoose.Schema({
  deckname: String,
  cards: []
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



//APP ROUTES

app.post('/', function(req,res){
  var card = new Card({front: req.body.front, back: req.body.back, deck:req.body.deck});
  var newCardID;
  card.save(function(err, card){
    if (err){
      console.log(err);
    } else{
      console.log(card);
      newCardID = card._id;
    }
  });

  console.log("the new card's unique ID is: " + card._id);

  Deck.findOne({deckname:req.body.deck}, function(err,existingDeck){
    if(existingDeck){
      console.log('adding to existing deck: ' + req.body.deck);
      existingDeck.cards.push(newCardID);
    } else {
      var newDeck = new Deck({deckname:req.body.deck});
      console.log('new deck created with name: ' + req.body.deck);
      newDeck.cards.push(newCardID);
      console.log('card pushed to deck');
      console.log(newDeck);
      console.log(newCardID);

      newDeck.save(function(err,deck){
        if (err){
          console.log(err);
        } else {
          console.log(deck);
        }
      });
    }
  });

  console.log(card.front, card.back);
  res.send(req.body.self);
});

app.get('/', function(req,res){
  console.log('/');
  fs.createReadStream(path.join(__dirname + '/signin.html')).pipe(res);
});

app.get('/index', function(req,res){
  fs.createReadStream(path.join(__dirname + '/index.html')).pipe(res);
});

app.get('/deck', function(req, res){
  Card.find(function(err, cards){
    res.send(cards);
  });
});







app.listen(8080);
console.log('express app listening on 8080.....');




