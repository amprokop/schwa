Schwa.IndexView = Backbone.View.extend({

  model: Schwa.Decks,

  initialize: function(){
    this.decks = new Schwa.Decks();
    this.register_helper();
  },

  events: {
    "click .dck" : "deck_change",
    "click .edit" : "edit_deck",
    "click .delete" : "delete_deck"
  },

  deck_change: function(e){
    var deckID = e.currentTarget.className.split(' ')[1];
    console.log('fdsafasd')
    this.trigger('deck_render', deckID);
  },

  edit_deck: function(e){
    var deckID = e.currentTarget.className.split(' ')[1];
    this.trigger('edit_deck', deckID);
  },

  delete_deck : function(e){
    var deckId = e.currentTarget.className.split(' ')[1];
    var data = {deckId: deckId};
    var url = 'http://localhost:8080/delete/deck';
    var prompt = confirm("Do you really want to delete this deck?");
    if (prompt === true){
      $.ajax({
        url:url,
        type:"DELETE",
        data:JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(){
          console.log('deleted!', data);
        },
        error: function(){
          console.log('error! ', data);
        }
      });
    }
    console.log($('.' + deckId));
    $('.' + deckId).parent().parent().remove();
    // $('.' + deckId)..append('remember our fallen homies');
  },

  startRender: function(){
    this.tallyCardsToReview();
  },

  tallyCardsToReview: function(){
    var data = this.decks.models[0].attributes;
    var memos = data.memos; 
    var reviewCrumbs = {};
    for (var i = 0; i < memos.length; i++){
      var memo = memos[i]; 
      if ( !reviewCrumbs[memo._deckid] ){ 
        reviewCrumbs[memo._deckid] = 0; 
      }
      if ( this.needsReview(memo) ){
       reviewCrumbs[memo._deckid]++;
      }
    }
    var decks = this.decks.models[0].attributes.decks;
    for (var j = 0; j < decks.length; j++){
      var deck = decks[j];
      deck.cardstoReview = reviewCrumbs[deck._id];
    }
    this.sort_decks(decks);
    this.render();
  },

   needsReview: function(card){
    var nextReviewDate = card.nextDate;
    var today = new Date().setHours(0,0,0,0);
    console.log("heres the memo\n", card, '\n heres today', today, '\n heres the nextdate', card.nextDate )
    if (nextReviewDate <= today) {
      return true;
    }
    return false;
  },

  sort_decks: function(decks){
    function compare(a,b){
      if ( a.cardstoReview < b.cardstoReview ){ return 1 };
      if ( a.cardstoReview > b.cardstoReview ){ return -1 };
      return 0;
    }
    decks.sort(compare);
  },

  render: function(){
    this.$el.empty();
    var decks = this.decks.models[0].attributes.decks;
    var source = {
      decks : decks
    };
    var uncompiledTemplate  = $('#decks-template').html();
    var template = Handlebars.compile(uncompiledTemplate);
    var populatedTemplate = template(source);
    this.$el.append(template(source));
    return this;
  },

  register_helper: function(){
    Handlebars.registerHelper('if_even', function(conditional, options) {
      if((conditional % 2) == 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
  }

});