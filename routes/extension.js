var fs = require('fs'),
    path = require('path'),
    handlebars = require('handlebars'),
    keys = require('.././keys'),
    Shred = require("shred"),
    shred = new Shred(),
    helpers = require('.././helpers'),
    url = require('url'),
    mongoosedb = require('.././mongoosedb'),
    querystring = require('querystring');

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
    var source = { decks : user.decks },
        uncompiledTemplate  = fs.readFileSync(path.join('./views/chrome-newcard.html'), "utf8"),
        template = handlebars.compile(uncompiledTemplate),
        populatedTemplate = template(source);
    res.write(populatedTemplate);
  });
};

exports.openPopupWithSelectedText = function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  mongoosedb.User.findOne({_id: req.user._id})
  .populate('decks')
  .exec(function(err, user){
    var query = url.parse(req.url).query,
        selectedText = querystring.parse(query).text,
        currentUrl = querystring.parse(query).url,
        source = {
          selectedText : selectedText.substring(1,selectedText.length),  
          decks : user.decks,
          currentUrl : currentUrl
          //TODO: Store URL.
        },
        uncompiledTemplate  = fs.readFileSync(path.join('./views/chrome-newcard.html'), "utf8"),
        template = handlebars.compile(uncompiledTemplate),
        populatedTemplate = template(source);
    console.log(populatedTemplate);
    res.write(populatedTemplate);
  });
};

exports.openNewDeckPopup = function(req,res){
  fs.createReadStream(path.join('./views/newdeck.html')).pipe(res);
};


exports.addNewDeck = function(req,res){
  if (!req.user) res.redirect('/extension-login');
  var deckname = req.body.deckName,
      defaultLang = req.body.defaultLanguage,
      saveUrl,
      autoTranslate;
  saveUrl = req.body.urlPref ? true : false;
  autoTranslate = req.body.translationPref ? true : false;
  mongoosedb.Deck.findOne({deckname: deckname, _creator: req.user._id}, function(err,deck){
    if (deck){
      res.write('Deck already exists. Don\'t do this to me! Log in to the website to delete.')
    } else {
      var newDeck = new mongoosedb.Deck({deckname:deckname, defaultLang: defaultLang, autoTranslate: autoTranslate, saveUrl: saveUrl, _creator: req.user._id });
      newDeck.save(function(err,deck){
        if (err){
          console.log(err);
        } else {
          mongoosedb.User.findOne({_id: req.user._id}, function(err, user){
            user.decks.push(newDeck._id);
            user.save();
          });
        }
      });
    }
  });
  res.redirect('/chrome');
};

exports.addNewCard = function(req,res){
  if (!req.user) res.redirect('/extension-login');
  var front = req.body.front, back = req.body.back, deckId;
  if (!front) res.write("Hey! You tried to submit an empty card!");
  var deckInfo = req.body.existingDeck.split("%%%"), deckId = deckInfo[0], deckname = deckInfo[1],
      card = new mongoosedb.Card({front: front, back: back, deckname: deckname});
  card.save()
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
  fs.createReadStream(path.join('.' + '/views/close.html')).pipe(res);
};

exports.addNewCardWithTranslations = function(req,res){
  if (!req.user){ res.redirect('/extension-login') };
  var front = req.body.front, back = helpers.definitionObjectParser(req.body).join(',\n'), deckId = req.body.deckId, deckname = req.body.deckname;
  if (!front){ res.write("Hey! You tried to submit an empty card!"); }
  var card = new mongoosedb.Card({front: front, back: back, deckname: deckname});
  card.save();
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
  var deckname = req.body.existingDeck.split("%%%")[1],
      deckId = req.body.existingDeck.split("%%%")[0],
      text = req.body.front;
  mongoosedb.Deck.findOne({_id: deckId}, function(err, deck){
    var lang = deck.defaultLang,
        getTranslationUrl = 'http://api.wordreference.com/0.8/' + keys.wordReference +  '/json/'+ lang + 'en/' + text.split(" ").join("+");
    var translationReq = shred.get({
      url: getTranslationUrl,
      headers: {
        Accept: 'application/json'
      },
      on: {
        response: function(response){
          var translations = helpers.wordAPIOutputParser(JSON.parse(response.content.body.toString())),
              source = { translations : translations, front : text, deckname: deckname, deckId: deckId },
              uncompiledTemplate  = fs.readFileSync(path.join('./views/chrome-translate.html'), "utf8"),
              template = handlebars.compile(uncompiledTemplate),
              populatedTemplate = template(source);
          res.write(populatedTemplate);
        }
      }
    });
  });
};
