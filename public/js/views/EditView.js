Schwa.EditView = Backbone.View.extend({
  model: Schwa.Deck,

  initialize: function(){
    this.deck = new Schwa.Deck();
    this.deck.url = "/edit" + "/" + this.id;
    var that = this;
    this.deck.fetch({
      success: function(){
        that.render();
      }
    });
  },

  render: function(){
    this.$el.empty();
    var cards = this.deck.models;
    var that = this;
    for (var i=0; i<cards.length; i++){
      var front = cards[i].attributes.front;
      var back = cards[i].attributes.back;
      var cardID = cards[i].attributes._id;
      var context = {front: front, back: back, cardID: cardID};
      var uncompiledTemplate = $('#edit').html();
      var template = Handlebars.compile(uncompiledTemplate);
      that.$el.append(template(context));
    }
    return this;
  }

});