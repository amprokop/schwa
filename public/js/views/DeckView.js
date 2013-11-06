Flshr.DeckView = Backbone.View.extend({
  model: Flshr.Deck,


  initialize: function(url){
    console.log(this.url);
    this.currentCard = 0;
    this.deck = new Flshr.Deck({url:this.url});
    this.on('deck_change', function(e){
      this.change_deck(e);
    });
    var that = this;
    this.deck.fetch({
      success: function(){
        that.render(0);
      }
    });
    //on change call render
  },

  events: {
    "deck_change" : "change_deck"
  },

  change_deck: function(id){
    this.deck = new Flshr.Deck({
      id: id
    });
    //Created a new model every time the deck changes--better to filter it?
    var that = this;
    this.deck.fetch({
      success: function(){
        that.render(0);
      }
    });
  },

  render: function(id){
    var front = this.deck.at(id).attributes.front;
    var back = this.deck.at(id).attributes.back;
    var deckname = this.deck.at(id).attributes.deckname;
    var context = {front: front, back: back, deckname:deckname};
    var uncompiledTemplate = $('#card').html();
    var template = Handlebars.compile(uncompiledTemplate);
    this.$el.html(template(context));
    return this;
  },

  next: function(){
    console.log(this.deck.length);
    if (this.currentCard === this.deck.length - 1){
      alert("end of deck");
      return;
    }
    this.currentCard++;
    this.render(this.currentCard);
  },

  flip: function(){
    $('#hidden').css("visibility","visible");

  }

});