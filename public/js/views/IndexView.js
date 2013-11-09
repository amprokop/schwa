Flshr.IndexView = Backbone.View.extend({

  model: Flshr.Decks,

  initialize: function(){
    this.decks = new Flshr.Decks();
    var that = this;
    this.decks.fetch({
      success: function(){
        that.render();
      }
    });
  },

  events: {
    "click .dck" : "deck_change"
  },

  deck_change: function(e){
    var deckID = e.currentTarget.className.split(' ')[1];
    console.log(deckID);
    this.trigger('deck_render', deckID);
  },

  render: function(){
    var that = this;
    that.$el.empty();
    var data = this.decks.models[0].attributes;
    var memos = data.memos;
    var reviewCrumbs = {};
    for (var i = 0; i < memos.length; i++){
      var memo = memos[i]; 
      if (!reviewCrumbs[memo._deckid]){
        reviewCrumbs[memo._deckid] = 0;
      }
      var nextReviewDate = new Date(memo.nextDate).setHours(0,0,0,0);
      var today = new Date().setHours(0,0,0,0);
      if (nextReviewDate <= today){
        reviewCrumbs[memo._deckid]++;
        console.log(reviewCrumbs[memo._deckid]);
      }
    }
    var decks = data.decks;
    for (var j = 0; j < decks.length; j++){
      var uncompiledTemplate = $('#decks').html();
      var template = Handlebars.compile(uncompiledTemplate);
      var context = { deckname: decks[j].deckname,
                      deckID: decks[j]._id,
                      deck_length: decks[j].cards.length,
                      cards_to_review: reviewCrumbs[decks[j]._id] };
      that.$el.append(template(context));
    }
    return this;
  }

});