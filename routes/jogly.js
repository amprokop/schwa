var fs = require('fs'),
    path = require('path'),
    handlebars = require('handlebars'),
    mongoosedb = require('.././mongoosedb');


exports.startApp = function(req,res){
  if (!req.user){ res.redirect('/') };
  fs.createReadStream(path.join('./views/index.html')).pipe(res);
};

exports.sendCards = function(req, res){
  if (!req.user){ res.redirect('/') };
  mongoosedb.Card.find(function(err, cards){
    res.send(cards);
  });
};

exports.sendDecks = function(req, res){
  if (!req.user){ res.redirect('/') };
  mongoosedb.Deck.find(function(err, decks){
    res.send(decks);
  });
};

exports.sendMemosWithPopulatedCards = function(req, res){
  if (!req.user){ res.redirect('/') };
  var deckid = req.params[0];
  mongoosedb.Memo.find({_userid: req.user._id})
    .where('_deckid').equals(deckid)
    .populate('_cardid')
    .exec(function(err,memos){
      console.log(memos);
      res.send(memos);
    });
};

exports.sendDeckToEdit = function(req,res){
  if (!req.user){ res.redirect('/') };
  var deckid = req.params[0];
  mongoosedb.Deck.findOne({_id: deckid})
    .populate('cards')
    .exec(function(err, deck){
      res.send(deck.cards);
    });
};

exports.sendUserDecks = function(req, res){
  if (!req.user){ res.redirect('/') };
  mongoosedb.User.findOne({_id: req.user._id})
    .populate('decks')
    .populate('memos')
    .exec(function(err, user){
        res.send(user);
    });
};

exports.updateCard = function(req,res){
  var cardID = req.params[0]
      query = {"_id" : cardID},
      update = {front : req.body.front,
                back : req.body.back};
  mongoosedb.Card.findOneAndUpdate(query, update);
//TODO: reset intervals, etc to zero. 
};

exports.updateAlgorithmInfo = function(req,res){
  console.log(req.body);
  var query = {"_id" : req.body._id};
  var update = {interval : req.body.interval,
                repetitions : req.body.repetitions,
                EF : req.body.EF,
                nextDate: req.body.nextDate,
                prevDate: req.body.prevDate};
  mongoosedb.Memo.findOneAndUpdate(query, update, function(err, memo){
    if (err){
      console.log('error updating', err);
    } else {
      console.log('successsssss ', memo);
    }
  });
};

exports.deleteDeck = function(req, res){
  console.log('the deck in question:', req.body.deckId);
  var deckId = req.body.deckId;

  console.log(typeof deckId);

  mongoosedb.Deck.findOne({_id : deckId}).remove(function(err, deck){
    if (err){ console.log('deck remove error   ', err) };
  });
  mongoosedb.User.findOne({_id : req.user._id}, function(err, user){
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
};