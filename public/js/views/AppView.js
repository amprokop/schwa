var Flshr = Backbone.View.extend({


  events: {
    "click .thumbs_up" : "renderNextCard",
    "click .thumbs_side" : "renderNextCard",
    "click .thumbs_down" : "renderNextCard",
    "click .flipper" : "cardFlip"
  },

  initialize: function(){
    // this.currentCardId = 0;
    $(document.body).append(this.render().el);
    $('.card_container').html(this.renderDeckView().$el.html());
    this.router = new Flshr.Router({el: this.$el.find('#cards_container')});
    Backbone.history.start({pushState: true});
  },

  render: function(){
    var uncompiledTemplate = $('#app').html();
    var template = Handlebars.compile(uncompiledTemplate);
    this.$el.html(template);
    return this;
  },

  renderDeckView: function(){
    this.deckView = new Flshr.DeckView({el: this.$el.find('.card_container')});
    return this.deckView;
  },

  renderNextCard: function(e){
    this.deckView.next();
  },

  cardFlip: function(){
    this.deckView.flip();
  }

});