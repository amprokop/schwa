var express = require('express');
var mongoose = require('mongoose');
var fs = require('fs');
var handlebars = require('handlebars');
var consolidate = require('consolidate');
var path = require('path');

var app = express();


app.configure( function(){
  app.set('views', __dirname + '/');
  app.set('view engine', 'handlebars');
  app.set('view options', {layout: false});
  app.use(express.bodyParser());
  console.log(__dirname + './public');
  app.use('/public', express.static(__dirname + '/public'));

});

mongoose.connect('mongodb://localhost/flshr');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback(){
  console.log('successfully connected to mongo!');
});


var cardSchema = mongoose.Schema({
  front: String,
  back: String//,
  //collection: String,
  //source_URL: String,
  // reviews: Number,
  // pushed_up: Boolean,
  // pushed_down: Boolean,
  // created_at: { type: String, default: (new Date()).getTime() }
});

var Card = mongoose.model('Card', cardSchema);


app.post('/', function(req,res){
  var card = new Card({front: req.body.front, back: req.body.back});
  card.save(function(err, card){
    if (err){
      console.log(err);
    } else{
      console.log(card);
    }
  });

  console.log(card.front, card.back);
  res.send(req.body.self);
});

app.get('/', function(req,res){
  console.log("hello");
  console.log(path.join(__dirname + '.index.html'));
  fs.createReadStream(path.join(__dirname + '/index.html')).pipe(res);
});


app.listen(8080);
console.log('express app listening on 8080.....');




