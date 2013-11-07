Flshr.IndexView = Backbone.View.extend({

  model: Flshr.Decks,

  initialize: function(){
    this.decks = new Flshr.Decks();
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
    this.$el.empty();

    this.decks.each(function(deck){
      var deckname = deck.attributes.deckname;
      var deckID = deck.attributes._id;
      var deckLength = deck.collection.length;
      var uncompiledTemplate = $('#decks').html();
      var template = Handlebars.compile(uncompiledTemplate);
      var context = {deckname: deckname, deckID: deckID};
      that.$el.append(template(context));
    });
    return this;
  }

});