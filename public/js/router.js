Flshr.Router = Backbone.Router.extend({


  routes: {
    "": "cards",
    "settings" : "settings",
    // "*" : "deckview"
  },

  cards: function(){
    // var appView = new Flshr.AppView();
    // this.renderView(appView);
  },

  renderView: function(view){
    this.$el.html( view.render().el);
  }
});
