Flshr.DeckView = Backbone.View.extend({
  model: Flshr.Deck,


  initialize: function(url){
    this.currentCard = 0;
    this.deck = new Flshr.Deck();
    if (this.id){
      this.deck.url = "/decks" + "/" + this.id;
    }
    // this.on('deck_change', function(e){
    //   this.change_deck(e);
    // });
    var that = this;
    this.deck.fetch({
      success: function(){
        that.render(0);
      }
    });
    //on change call render
  },

  events: {
    "click .ratings" : "next"
  },


  render: function(id){
    var attrs = this.deck.at(id).attributes;
    var front = attrs.front;
    var back = attrs.back;
    var deckname = attrs.deckname;
    
    var context = {front: front, back: back, deckname:deckname};

    var uncompiledTemplate = $('#card').html();
    var template = Handlebars.compile(uncompiledTemplate);
    this.$el.html(template(context));

    return this;
  },

  next: function(e){
    this.currentCard++;
    if (!this.deck.at(this.currentCard)){
      console.log('done');
      //renderFinishedView();
      return;
    }
    console.log(e.target.className);
    this.render(this.currentCard);
  },

  flip: function(){
    $('#hidden').css("visibility","visible");
  }

});