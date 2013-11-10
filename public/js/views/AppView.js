// var Flshr = {};
// _.extend(Flshr, Backbone.Events);

// Flshr.AppView = Backbone.View.extend({
// Backbone.View.prototype.close = function () {
//     console.log('Unbinding events for ' + this.cid);
//     this.remove();
//     this.unbind();
//     if (this.onClose) {
//         this.onClose();
//     }
// };


var Flshr = Backbone.View.extend({

  events: {
    "click .deck_list" : "renderIndexView"
  },

  initialize: function(){
    var uncompiledTemplate = $('#app').html();
    this.template = Handlebars.compile(uncompiledTemplate);
    $(document.body).append(this.render().el);
    this.renderIndexView();
    this.listenTo(this.indexView, "deck_render", this.renderDeckView);
    this.listenTo(this.indexView, "edit_deck", this.renderEditView);

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
    this.$cardContainer.empty();
    this.deckView = new Flshr.DeckView({el: this.$cardContainer, id: e});
    return this.deckView;
  },

  renderIndexView: function(){
    // var that = this;
    // this.$el.find('.card_container').empty();
    // if (!this.indexView){
    //   this.indexView = new Flshr.IndexView({el: this.$cardContainer});
    // // } else {
    //   this.indexView.close();
      this.indexView = new Flshr.IndexView({el: this.$cardContainer});      
    // }
    // this.listenTo(this.indexView, "deck_render", this.renderDeckView);
  },

  renderEditView: function(e){
    this.editView = new Flshr.EditView({el: this.$cardContainer, id: e});
  }

  // renderNextCard: function(e){
  //   this.deckView.next();
  // },

  // cardFlip: function(){
  //   this.deckView.flip();
  // }


});