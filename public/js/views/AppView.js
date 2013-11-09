// var Flshr = {};
// _.extend(Flshr, Backbone.Events);

// Flshr.AppView = Backbone.View.extend({

var Flshr = Backbone.View.extend({


//Is it better to make a single call that grabs all the data from the server 
//when a new session is created?
//In that case, should I be instantiating the model in the AppView?

  events: {
    "click .thumbs_up" : "renderNextCard",
    "click .thumbs_side" : "renderNextCard",
    "click .thumbs_down" : "renderNextCard",
    "click .flipper" : "cardFlip",
    "click .deck_list" : "renderIndexView"
  },

  initialize: function(){
    var uncompiledTemplate = $('#app').html();
    this.template = Handlebars.compile(uncompiledTemplate);
    $(document.body).append(this.render().el);
    this.renderIndexView();
    this.listenTo(this.indexView, "deck_render", this.renderDeckView);

    // $('.card_container').html(this.renderDeckView().$el.html());
    // this.router = new Flshr.Router({el: this.$el.find('#cards_container')});
    // Not using a router at the moment. Would a router be helpful here?
    // Backbone.history.start({pushState: true});
  },

  render: function(){
    this.$el.html(this.template);
    this.$cardContainer = this.$el.find('.card_container');
    return this;
  },

  //useless function:
  // switch_deck: function(e){
  //   var getURL = e;
  //   console.log(getURL);
  //   this.renderDeckView(e);
  //   this.deckView.trigger('deck_change', getURL);
  // },

  renderDeckView: function(e){
    this.deckView = new Flshr.DeckView({el: this.$cardContainer, id: e});
    return this.deckView;
  },

  renderIndexView: function(){
    // var that = this;
    // this.$el.find('.card_container').empty();
    this.indexView = new Flshr.IndexView({el: this.$cardContainer});
    console.log('here renderind', this.indexView);
    // this.listenTo(this.indexView, "deck_render", this.renderDeckView);
  },

  renderEditView: function(){
    // this.editView = new Flshr.EditView({el: this.$cardContainer, id: e});
  },

  renderNextCard: function(e){
    this.deckView.next();
  },

  cardFlip: function(){
    this.deckView.flip();
  }


});