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

var db = require('./mongoose'); 


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
db.on('error', console.error.bind(console, 'there was an error when connecting to mongodb'));
// db.once('open', function callback(){
//   console.log('successfully connected to mongo!');
// });

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
  //...is there a way to streamline this process?
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
//Not used yet----- need to implement user authentication first.

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



var User = mongoose.model('User', userSchema);
var Card = mongoose.model('Card', cardSchema);
var Deck = mongoose.model('Deck', deckSchema);
var Memo = mongoose.model('Memo', memoSchema);




//if the user has a default language in one of his or her decks, and it matches up with the language detected, then add



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


//TODO: add DELETE CARD 

















//DATABASE POST 


app.post('/new_deck', function(req,res){
  console.log("NEW DECK CALLED");
  if (!req.user){ res.redirect('/extension-login') };
  var deckname = req.body.deckName;
  var defaultLang = req.body.defaultLanguage;
  var saveUrl;
  var autoTranslate;
  req.body.urlPref ? saveUrl = true : saveUrl = false;
  req.body.translationPref ? autoTranslate = true : autoTranslate = false;
  Deck.findOne({deckname: deckname, _creator: req.user._id}, function(err,deck){
    if (deck){
      res.write('Deck already exists. Don\'t do this to me! Log in to the website to delete.')
    } else {
      var newDeck = new Deck({deckname:deckname, defaultLang: defaultLang, autoTranslate: autoTranslate, saveUrl: saveUrl, _creator: req.user._id });
      newDeck.save(function(err,deck){
        if (err){
          console.log(err);
        } else {
          console.log(req.user)
          console.log("New deck created with name: " + deck.deckname);
          User.findOne({_id: req.user._id}, function(err, user){
            if (err){
              console.log(err);
            } else {
              console.log("Now pushing to the current user " + req.user._id + "s decks");
              user.decks.push(newDeck._id);
              console.log(user.decks);
              user.save(function(err,user){
                if (err){
                  console.log(err);
                }              
              });
            }
          });
        }
      });
    }
  });
  res.redirect('/chrome');
});


app.post('/chrome/translate', function(req,res){
  var deckname = req.body.existingDeck.split("%%%")[1];
  var deckId = req.body.existingDeck.split("%%%")[0];
  var text = req.body.front;
  console.log("REEEEEQQQreq", req.body);

  Deck.findOne({_id: deckId}, function(err, deck){
    if (err){console.log(err)};
    console.log('\n\n\n\n\n\n\n\n\n\nn\n\n\n\n\n\nnn\n\n\n\n\n\n\n\n\'',deck)
    var lang = deck.defaultLang;
    if (lang === "en"){
      //res.write('The language for this deck is English. Translation is only available from other languages to English. Sorry!');
      return;
    };
    var getTranslationUrl = 'http://api.wordreference.com/0.8/' + keys.wordReference +  '/json/'+ lang + 'en/' + text.split(" ").join("+");
    var translationReq = shred.get({
      url: getTranslationUrl,
      headers: {
        Accept: 'application/json'
      },
      on: {
        response: function(response){
          console.log("wordreferenceresponded:")
          console.log(response.content.body.toString());
          var translations = helpers.wordAPIOutputParser(JSON.parse(response.content.body.toString()));
          console.log('translations\n', translations)
          var source = { translations : translations, front : text, deckname: deckname, deckId: deckId };
          console.log('source\n', source);
          var uncompiledTemplate  = fs.readFileSync(path.join(__dirname + '/chrome-translate.html'), "utf8");
          var template = handlebars.compile(uncompiledTemplate);
          var populatedTemplate = template(source);
          console.log(populatedTemplate);
          res.write(populatedTemplate);
        }
      }
    });
  });
});



































//GET APP ROUTES

app.get('/', function(req,res){
  fs.createReadStream(path.join(__dirname + '/signin.html')).pipe(res);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/index', function(req,res){
  if (!req.user){ res.redirect('/') };
  fs.createReadStream(path.join(__dirname + '/index.html')).pipe(res);
});











//EXTENSION ROUTES

app.get('/chrome', function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  User.findOne({_id: req.user._id})
  .populate('decks')
  .exec(function(err, user){
    var source = { decks : user.decks };
    var uncompiledTemplate  = fs.readFileSync(path.join(__dirname + '/chrome-newcard.html'), "utf8");
    var template = handlebars.compile(uncompiledTemplate);
    var populatedTemplate = template(source);
    res.write(populatedTemplate);
  });
});

app.get('/newdeck', function(req,res){
  //add SelectedText in there using querystring
  //or keep it somewhere?????
  fs.createReadStream(path.join(__dirname + '/newdeck.html')).pipe(res);
});

app.get('/chrome/logout', function(req, res){
  req.logout();
  res.redirect('/extension-login');
});

app.get('/extension-login', function(req,res){
  fs.createReadStream(path.join(__dirname + '/extension-signin.html')).pipe(res);
});

app.get('/chrome/new_card/*', function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  User.findOne({_id: req.user._id})
  .populate('decks')
  .exec(function(err, user){
    var query = url.parse(req.url).query;
    var selectedText = querystring.parse(query).text;
    var currentUrl = querystring.parse(query).url;
    var source = {
      selectedText : selectedText.substring(1,selectedText.length),  
      decks : user.decks,
      currentUrl : currentUrl
      //The URL isn't being stored. Start here to fix that.
    };
    var uncompiledTemplate  = fs.readFileSync(path.join(__dirname + '/chrome-newcard.html'), "utf8");
    var template = handlebars.compile(uncompiledTemplate);
    var populatedTemplate = template(source);
    console.log(populatedTemplate);
    res.write(populatedTemplate);
  });
});










//DATABASE GET ROUTES

app.get('/deck', function(req, res){
  if (!req.user){ res.redirect('/') };
  Card.find(function(err, cards){
    res.send(cards);
  });
});

app.get('/decks', function(req, res){
  if (!req.user){ res.redirect('/') };
  Deck.find(function(err, decks){
    res.send(decks);
  });
});

app.get('/decks/*', function(req, res){
  if (!req.user){ res.redirect('/') };
  var deckid = req.params[0];
  Memo.find({_userid: req.user._id})
    .where('_deckid').equals(deckid)
    .populate('_cardid')
    .exec(function(err,memos){
      res.send(memos);
    });
});

app.get("/edit/*", function(req,res){
  if (!req.user){ res.redirect('/') };
  var deckid = req.params[0];
  Deck.findOne({_id: deckid})
    .populate('cards')
    .exec(function(err, deck){
      res.send(deck.cards);
    });
});

app.get('/user/decks', function(req, res){
  if (!req.user){ res.redirect('/') };
  User.findOne({_id: req.user._id})
    .populate('decks')
    .populate('memos')
    .exec(function(err, user){
        res.send(user);
//backbone's built in features break here. to make it work again, send user.decks
    });
});







//DATABASE POST ROUTES


//Making a new card.

app.post('/new_card', function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  var front = req.body.front, back = req.body.back, deckId;
  if (!front){ res.write("Hey! You tried to submit an empty card!")};
  var deckInfo = req.body.existingDeck.split("%%%");
  var deckId = deckInfo[0];
  var deckname = deckInfo[1];
//TODO: add _creator to card?
  var card = new Card({front: front, back: back, deckname: deckname});
  card.save(function(err, card){
    if (err){vconsole.log(err) };
  });
//An async problem may exist here. If the Deck query starts before the Card query returns, card._id will be undefined.
  Deck.findOne({_id: deckId}, function(err,deck){
    deck.cards.push(card._id);
    deck.save();
    memo = new Memo({_cardid: card._id,
                    _userid: req.user._id,
                    _deckid: deck._id,
                    interval: 0,
                    repetitions: 0,
                    EF:2.5,
                    nextDate: new Date().setHours(0,0,0,0),
                    prevDate: new Date().setHours(0,0,0,0)
                  });
    memo.save(function(err,memo){
      User.findOne({_id: req.user._id}, function(error, user){
        user.memos.push(memo._id);
        user.save();
      });
    });
  });
  res.send(req.body.self);
});

app.post('/new_card/translated', function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  var front = req.body.front, back = helpers.definitionObjectParser(req.body).join(',\n'), deckId = req.body.deckId, deckname = req.body.deckname;
  console.log(back);
  if (!front){ res.write("Hey! You tried to submit an empty card!"); }
  var card = new Card({front: front, back: back, deckname: deckname});
  card.save(function(err, card){
    if (err){ console.log(err);} 
    console.log('card back', card.back);
  });
//An async problem may exist here. If the Deck query starts before the Card query returns, card._id will be undefined.
  Deck.findOne({_id: deckId}, function(err,deck){
    deck.cards.push(card._id);
    deck.save();
    memo = new Memo({_cardid: card._id,
                    _userid: req.user._id,
                    _deckid: deck._id,
                    interval: 0,
                    repetitions: 0,
                    EF:2.5,
                    nextDate: new Date().setHours(0,0,0,0),
                    prevDate: new Date().setHours(0,0,0,0)
                  });
    memo.save(function(err,memo){
      User.findOne({_id: req.user._id}, function(error, user){
        user.memos.push(memo._id);
        user.save();
      });
    });
  });
  res.send(req.body.self);
  console.log(req.body);
});






//DATABASE PUT/UPDATE ROUTES  --TODO:// change to put.

app.post("/edit/card/*", function(req,res){
  var cardID = req.params[0];
  var query = {"_id" : cardID};
  var update = {front : req.body.front,
                back : req.body.back};
  Card.findOneAndUpdate(query, update, function(err, card){
    if (err){ console.log('error updating card') }; 
  })

//TODO: reset intervals, etc to zero.  
});

app.post('/decks/*', function(req,res){
  console.log(req.body);
  var query = {"_id" : req.body._id};
  var update = {interval : req.body.interval,
                repetitions : req.body.repetitions,
                EF : req.body.EF,
                nextDate: req.body.nextDate,
                prevDate: req.body.prevDate};
  Memo.findOneAndUpdate(query, update, function(err, memo){
    if (err){
      console.log('error updating', err);
    } else {
      console.log('successsssss ', memo);
    }
  });
});


//DATABASE DELETE ROUTES


//DELETE

app.delete('/delete/deck', function(req, res){
  console.log('the deck in question:', req.body.deckId);
  var deckId = req.body.deckId;

  console.log(typeof deckId);

  Deck.findOne({_id : deckId}).remove(function(err, deck){
    if (err){ console.log('deck remove error   ', err) };
  });
  User.findOne({_id : req.user._id}, function(err, user){
    if (err){console.log(err)}; 
    for (var i = 0; i < user.decks.length; i++){
      if (user.decks[i] === deckId){
        user.decks.splice(user.decks[i], 1);
        break;
      }
    }
    user.save(function(err, user){
      if (err){ console.log('user deck delete error    ', err)}
    });
  });
  //TODO: This doesn't delete all the cards or the memos. Ghost records will still exist. Need to clean up cards and memos.
});




app.listen(8080);
console.log('This ya boy BIG EXPRESS.JS we listenin on 8080 nahmean?');






