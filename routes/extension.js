var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');
var keys = require('.././keys')
var Shred = require("shred");
var shred = new Shred();
var helpers = require('.././helpers');
var url = require('url');
var mongoosedb = require('.././mongoosedb')

exports.signIn = function(req,res){
  // res.render('extension-signin');
  fs.createReadStream(path.join('.' + '/views/extension-signin.html')).pipe(res);
};

exports.logOut = function(req, res){
  req.logout();
  res.redirect('/extension-login');
};


exports.openNewCardPopup = function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  mongoosedb.User.findOne({_id: req.user._id})
  .populate('decks')
  .exec(function(err, user){
    var source = { decks : user.decks };
    var uncompiledTemplate  = fs.readFileSync(path.join('./views/chrome-newcard.html'), "utf8");
    var template = handlebars.compile(uncompiledTemplate);
    var populatedTemplate = template(source);
    res.write(populatedTemplate);
  });
};

exports.openPopupWithSelectedText = function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  mongoosedb.User.findOne({_id: req.user._id})
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
    var uncompiledTemplate  = fs.readFileSync(path.join('./views/chrome-newcard.html'), "utf8");
    var template = handlebars.compile(uncompiledTemplate);
    var populatedTemplate = template(source);
    console.log(populatedTemplate);
    res.write(populatedTemplate);
  });
};

exports.openNewDeckPopup = function(req,res){
  //add SelectedText in there using querystring
  //or keep it somewhere?????
  fs.createReadStream(path.join('./views/newdeck.html')).pipe(res);
};






exports.addNewDeck = function(req,res){
  console.log("NEW DECK CALLED");
  if (!req.user){ res.redirect('/extension-login') };
  var deckname = req.body.deckName;
  var defaultLang = req.body.defaultLanguage;
  var saveUrl;
  var autoTranslate;
  req.body.urlPref ? saveUrl = true : saveUrl = false;
  req.body.translationPref ? autoTranslate = true : autoTranslate = false;
  mongoosedb.Deck.findOne({deckname: deckname, _creator: req.user._id}, function(err,deck){
    if (deck){
      res.write('Deck already exists. Don\'t do this to me! Log in to the website to delete.')
    } else {
      var newDeck = new mongoosedb.Deck({deckname:deckname, defaultLang: defaultLang, autoTranslate: autoTranslate, saveUrl: saveUrl, _creator: req.user._id });
      newDeck.save(function(err,deck){
        if (err){
          console.log(err);
        } else {
          console.log(req.user)
          console.log("New deck created with name: " + deck.deckname);
         mongoosedb.User.findOne({_id: req.user._id}, function(err, user){
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
};


exports.addNewCard = function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  var front = req.body.front, back = req.body.back, deckId;
  if (!front){ res.write("Hey! You tried to submit an empty card!")};
  var deckInfo = req.body.existingDeck.split("%%%");
  var deckId = deckInfo[0];
  var deckname = deckInfo[1];
//TODO: add _creator to card?
  var card = new mongoosedb.Card({front: front, back: back, deckname: deckname});
  card.save(function(err, card){
    if (err){vconsole.log(err) };
  });
//An async problem may exist here. If the Deck query starts before the Card query returns, card._id will be undefined.
  mongoosedb.Deck.findOne({_id: deckId}, function(err,deck){
    deck.cards.push(card._id);
    deck.save();
    memo = new mongoosedb.Memo({_cardid: card._id,
                    _userid: req.user._id,
                    _deckid: deck._id,
                    interval: 0,
                    repetitions: 0,
                    EF:2.5,
                    nextDate: new Date().setHours(0,0,0,0),
                    prevDate: new Date().setHours(0,0,0,0)
                  });
    memo.save(function(err,memo){
     mongoosedb.User.findOne({_id: req.user._id}, function(error, user){
        user.memos.push(memo._id);
        user.save();
      });
    });
  });
  res.send(req.body.self);
};

exports.addNewCardWithTranslations = function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  var front = req.body.front, back = helpers.definitionObjectParser(req.body).join(',\n'), deckId = req.body.deckId, deckname = req.body.deckname;
  console.log(back);
  if (!front){ res.write("Hey! You tried to submit an empty card!"); }
  var card = new mongoosedb.Card({front: front, back: back, deckname: deckname});
  card.save(function(err, card){
    if (err){ console.log(err);} 
    console.log('card back', card.back);
  });
//An async problem may exist here. If the Deck query starts before the Card query returns, card._id will be undefined.
  mongoosedb.Deck.findOne({_id: deckId}, function(err,deck){
    deck.cards.push(card._id);
    deck.save();
    memo = new mongoosedb.Memo({_cardid: card._id,
                    _userid: req.user._id,
                    _deckid: deck._id,
                    interval: 0,
                    repetitions: 0,
                    EF:2.5,
                    nextDate: new Date().setHours(0,0,0,0),
                    prevDate: new Date().setHours(0,0,0,0)
                  });
    memo.save(function(err,memo){
     mongoosedb.User.findOne({_id: req.user._id}, function(error, user){
        user.memos.push(memo._id);
        user.save();
      });
    });
  });
  res.send(req.body.self);
  console.log(req.body);
};

exports.translateInputAndReturnPopup = function(req,res){
  var deckname = req.body.existingDeck.split("%%%")[1];
  var deckId = req.body.existingDeck.split("%%%")[0];
  var text = req.body.front;
  console.log("REEEEEQQQreq", req.body);

  mongoosedb.Deck.findOne({_id: deckId}, function(err, deck){
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
          var uncompiledTemplate  = fs.readFileSync(path.join('./views/chrome-translate.html'), "utf8");
          var template = handlebars.compile(uncompiledTemplate);
          var populatedTemplate = template(source);
          console.log(populatedTemplate);
          res.write(populatedTemplate);
        }
      }
    });
  });
};
