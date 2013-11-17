var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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



exports.User = mongoose.model('User', userSchema);
exports.Card = mongoose.model('Card', cardSchema);
exports.Deck = mongoose.model('Deck', deckSchema);
exports.Memo = mongoose.model('Memo', memoSchema);