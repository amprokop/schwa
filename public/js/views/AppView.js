// var Schwa = {};
// _.extend(Schwa, Backbone.Events);
// vent = _.extend({}, Backbone.Events);
// vent.on("some:event", function(){
//   console.log("some event was fired");
// });

var Schwa = Backbone.View.extend({

  events: {
    "click .deck_list" : "renderIndexView",
    "edit_deck" : "renderEditView",
    "delete_deck" : "deleteDeck"
  },

  initialize: function(){
    var uncompiledTemplate = $('#app').html();
    this.template = Handlebars.compile(uncompiledTemplate);
    $(document.body).append(this.render().el);
    this.router = new Schwa.Router({el: this.$el.find('.card_container')});
    Backbone.history.start({pushState: true});
    this.renderIndexView();
  },

  render: function(){
    this.$el.html(this.template);
    this.$cardContainer = this.$el.find('.card_container');
    return this;
  },

  renderIndexView: function(){
    this.router.index();      
  }
});