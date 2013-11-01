var AppView = Backbone.View.extend({

  template: Templates['app'],

  events: {
    "click thumbs_up" : "renderNextCard"
    "click thumbs_side" : "renderNextCard"
    "click thumbs_down" : "renderNextCard"
  },

  initialize: function(){
    $(body).append(this.render().el);
    this.router = new Shortly.Router({el: this.$el.find('#cards_container')})
    Backbone.history.start({pushState: true});
  },

  render: function(){
    this.$el.html(this.template());
    return this;
  },

  renderDeckView: function(e){
    e && e.preventDefault;
  },

  next: function(e){
  }

})