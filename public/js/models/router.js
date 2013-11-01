Flshr.Router = Backbone.Router.extend({
    
  initialize: function(options){
    this.$el = options.el;
  },

  routes: {
    "": "cards",
    "settings" : "settings"
  },

  cards: function(){
    var appView = new Flshr.AppView();
    this.renderView(appView);
  },

  renderView: function(view){
    this.$el.html( view.render().el);
  }
});
