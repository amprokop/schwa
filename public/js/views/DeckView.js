Flshr.DeckView = Backbone.View.extend({
  model: Flshr.Deck,


  initialize: function(){
    this.currentCard = 0;
    this.deck = new Flshr.Deck();
    this.deck.on('add', function(){
    });
    var that = this;
    this.deck.fetch({
      success: function(){
        that.render(0);
      }
    });
    //on change call render
  },

  render: function(id){
    var front = this.deck.at(id).attributes.front;
    var back = this.deck.at(id).attributes.back;
    var context = {front: front, back: back};
    var uncompiledTemplate = $('#card').html();
    var template = Handlebars.compile(uncompiledTemplate);
    this.$el.html(template(context));
    return this;
  },

  next: function(){
    this.currentCard++;
    this.render(this.currentCard);
  },

  flip: function(){
    console.log('hide and seek');
    console.log($('#hidden').css('visibility'));
    $('#hidden').css("visibility","visible");

  }

});