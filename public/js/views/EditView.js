Flshr.EditView = Backbone.View.extend({
  model: Flshr.Deck,

  initialize: function(url){
  this.deck = new Flshr.Deck();
  this.deck.url = "/decks" + "/" + this.id;
  var that = this;
  this.deck.fetch({
    success: function(){
      that.render();
      }
  })
  },

  render: function(){

  },
    //on change call render
  },

})