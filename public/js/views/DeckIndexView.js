Flshr.IndexView = Backbone.View.extend({

  model: Flshr.Decks,

  initialize: function(){
    this.decks = new Flshr.Decks();
    console.log("IndexView initializing")
    var that = this;
    this.decks.fetch({
      success: function(){
        that.render();
      }
    });
  },

  events: {
    "click .dck" : "deck_change"
  },

  deck_change: function(e){
    var deckID = e.currentTarget.className.split(' ')[1];
    console.log(deckID);
    this.trigger('deck_render', deckID);
  },

  render: function(){
    var that = this;
    debugger;
    this.decks.each(function(deck){
      var deckname = deck.attributes.decks.deckname;
      var deckID = deck.attributes._id;
      var cards = deck.attributes.cards;
      var deck_length = cards.length;
      var cards_to_review = 0;
        for (var i = 0; i < cards.length; i++){
          var cardID = cards[i];
          for (var j = 0; j < deck.attributes.memos.length; j++){
            var memo = memo;
            if (cardID === memo._cardid) {
              var nextReviewDate = new Date(memo.nextDate).setHours(0,0,0,0);
              var today = new Date().setHours(0,0,0,0);
              if (nextReviewDate <= today){
                cards_to_review++;
              }
            }
          }
        }
      console.log(deckname, deckID, deck_length, cards_to_review);
      var uncompiledTemplate = $('#decks').html();
      var template = Handlebars.compile(uncompiledTemplate);
      var context = {deckname: deckname, deckID: deckID, deck_length: deck_length, cards_to_review: cards_to_review};
      that.$el.append(template(context));
    });
    return this;
  }

});