//Presently, your Chrome extension links to localhost:8080 for its popup. Must change in the build! Don't spend hours figuring this out.
//The extension's logout button is broken. When logging out and signing back in through the extension, you're redirected to the index page


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
var keys = require('./keys.js');

var app = express();

app.configure( function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser(keys.facebook));
  app.use(express.cookieSession());
  app.use(passport.initialize());
  app.use(passport.session({secret: keys.facebook, cookie: {maxAge: 60000}}));
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





app.get('/extension/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/extension/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/chrome',
                                      failureRedirect: '/extension-login' }));
















//APP ROUTES



/*TODO: At the moment, if the user has selected a deck from the dropdown, the card will be
placed into that deck, even if there is a value in the New Deck box. Change that.  */

app.post('/new_card/', function(req,res){
  if (!req.user){
    res.redirect('/extension-login');
  }

  var front = req.body.front, back = req.body.back, deckname, deckId;
  if (req.body.existingDeck !== ""){
    //Can we just use falsey values?
    var deckInfo = req.body.existingDeck.split("%%%");
    deckId = deckInfo[0];
    deckname = deckInfo[1];
    console.log("\n\n\n\n\n\nID, INFO", deckId, deckname);
  } else {
    deckname = req.body.newDeckName;
  }

//TODO: add _creator to card?

  var card = new Card({front: front, back: back, deckname: deckname});
  card.save(function(err, card){
    if (err){
      console.log(err);
    } else {
      console.log("New card created: " + card);
    }
  });
//An async problem may exist here. If the Deck query starts before the Card query returns, card._id will be undefined.
  if(deckId){
    Deck.findOne({_id: deckId}, function(err,deck){
      console.log('DeckID', deckId, '\n\n\n\n\n\n\n\n\n\n\n\n\nDeck', deck);
      deck.cards.push(card._id);
      deck.save();
      console.log('Card pushed to existing deck ', deck.deckname);
    });
  } else {
    var newDeck = new Deck({deckname:deckname});
      newDeck.cards.push(card._id);
      newDeck.save(function(err,deck){
        if (err){
          console.log(err);
        } else {
          console.log("New deck created with name: " + deck.deckname);
          console.log("Now pushing to the current user " + req.user._id + "s decks");
          User.findOne({_id: req.user._id}, function(err,user){
            user.decks.push(newDeck._id);
            console.log("User found! Here are the new decks:" + user.decks);
            user.save(function(err,deck){
            });
          });
        }
      });
    }
  res.send(req.body.self);

});




app.get('/', function(req,res){
  fs.createReadStream(path.join(__dirname + '/signin.html')).pipe(res);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/chrome/logout', function(req, res){
  req.logout();
  res.redirect('/extension-login');
});

app.get('/chrome/new_card/', function(req,res){
  fs.createReadStream(path.join(__dirname + '/chrome.html')).pipe(res);
});


app.get('/extension-login', function(req,res){
  fs.createReadStream(path.join(__dirname + '/extension-signin.html')).pipe(res);
});

app.get('/chrome', function(req,res){
  if (!req.user){
    res.redirect('/extension-login');
  }
  Deck.find(function(err, decks){
    var source = {
      decks : decks
    };
    var uncompiledTemplate  = fs.readFileSync(path.join(__dirname + '/chrome.html'), "utf8");
    var template = handlebars.compile(uncompiledTemplate);
    var populatedTemplate = template(source);
    res.write(populatedTemplate);
  });
});



app.get('/chrome/new_card/*', function(req,res){
  if (!req.user){
    res.redirect('/extension-login');
  }
  Deck.find(function(err, decks){
    var query = url.parse(req.url).query;
    var selectedText = querystring.parse(query).text;
    var selectedText = querystring.parse(query).url;
    var source = {
      selectedText : selectedText,
      decks : decks,
      url : url
    };
    var uncompiledTemplate  = fs.readFileSync(path.join(__dirname + '/chrome.html'), "utf8");
    var template = handlebars.compile(uncompiledTemplate);
    var populatedTemplate = template(source);
    console.log(populatedTemplate);
    res.write(populatedTemplate);
  });
});


app.get('/index', function(req,res){
  if (!req.user){
    res.redirect('/');
  }
  console.log(req.user);
  fs.createReadStream(path.join(__dirname + '/index.html')).pipe(res);
});

app.get('/deck', function(req, res){
  if (!req.user){
    res.redirect('/');
  }
  Card.find(function(err, cards){
    res.send(cards);
  });
});

app.get('/decks', function(req, res){
  console.log("deck", req.user);
  if (!req.user){
    res.redirect('/');
  }
  Deck.find(function(err, decks){
    res.send(decks);
  });
});

app.get('/decks/*', function(req, res){
  if (!req.user){
    res.redirect('/');
  }
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

app.get('/user/decks', function(req, res){
    if (!req.user){
    res.redirect('/');
    }

    User.findOne({_id: req.user._id})
      .populate('decks')
      .exec(function(err, user){
        if (err) {
          console.log('there was an error', err, deck);
        } else {
          res.send(user.decks);
        }
      });

//We need to retrieve pertinent information from the deck for each 
    // User.findOne({_id: userID})
    //   .populate('decks')
    //   .exec(function(err, user){
    //     if (err) {
    //       console.log('there was an error', err, deck);
    //     } else {
    //       user.decks.each
    //       .populate('cards')
    //       .exec(function(err,deck){}
    //     }
    //   })
});
































app.listen(8080);
console.log('express app listening on 8080.....');




