Flshr.Router = Backbone.Router.extend({

  initialize: function(options){
    this.$el = options.el;
    console.log('router initializing;')
    this.indexView = new Flshr.IndexView({el: this.$el});
    // this.index();
    this.deckView = new Flshr.DeckView({el: this.$el});
  },

  routes: {
    "": "index",
    "edit" : "edit",
    "deck" : "deck"
    // "results" : "results"
    // "settings" : "settings",
    // "*" : "deckview"
  },

  events: {
    'index_render' : 'index'
  },

  swapView: function(view){
    this.$el.html( view.render().el );
  },

  index: function(){
    this.$el.empty();
    var that = this;
    this.indexView.decks.fetch({
      reset: true,
      success: function(){
        console.log('fetched!');
        that.indexView.startRender();
      }
    });

    this.listenTo(this.indexView, "edit_deck", this.edit);
    this.listenTo(this.indexView, "deck_render", this.deck);
  },

  deck: function(e){
    console.log('deck called')
    this.deckView.deck.url = '/decks/' + e;
    var that = this;
    this.deckView.deck.fetch({
      success: function(){
        that.deckView.startReview();
      }
    })
  },

  edit: function(e){
    this.editView = new Flshr.EditView({el: this.$el, id: e});
  }



});
