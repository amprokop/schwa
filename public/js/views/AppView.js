// var Flshr = {};
// _.extend(Flshr, Backbone.Events);
// vent = _.extend({}, Backbone.Events);
// vent.on("some:event", function(){
//   console.log("some event was fired");
// });

var Flshr = Backbone.View.extend({

  events: {
    "click .deck_list" : "renderIndexView",
    "edit_deck" : "renderEditView",
    "delete_deck" : "deleteDeck"
  },

  initialize: function(){
    var uncompiledTemplate = $('#app').html();
    this.template = Handlebars.compile(uncompiledTemplate);
    $(document.body).append(this.render().el);
    this.router = new Flshr.Router({el: this.$el.find('.card_container')});
    Backbone.history.start({pushState: true});
    this.renderIndexView();
    // this.listenTo(this.indexView, "deck_render", this.deck);
    // this.listenTo(this.indexView, "edit_deck", this.edit);
  },

  render: function(){
    this.$el.html(this.template);
    this.$cardContainer = this.$el.find('.card_container');
    return this;
  },

  // renderDeckView: function(e){
  //   // this.$cardContainer.empty();
  //   // this.deckView = new Flshr.DeckView({el: this.$cardContainer, id: e});
  //   // return this.deckView;
  //   // e && e.preventDefault();,,kl,uhy
  //   // this.router.navigate("/deck", {trigger: true});

  // },

  renderIndexView: function(){
    this.router.index();
      // this.indexView = new Flshr.IndexView({el: this.$cardContainer});
      // e && e.preventDefault();
      // console.log('renderIndexView called in appView');
      // this.listenTo(this.indexView, "edit_deck", this.renderDeckView);
      
  }

  // renderEditView: function(e){
  //   // this.editView = new Flshr.EditView({el: this.$cardContainer, id: e});
  //   // e && e.preventDefault(); 
  //   // this.router.navigate("/edi", {trigger: true});
// }


});