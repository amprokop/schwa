Flshr.DeckView = Backbone.View.extend({
  model: Flshr.Deck,


  initialize: function(url){
    this.currentCard = 0;
    this.deck = new Flshr.Deck();
    if (this.id){
      this.deck.url = "/decks/" + this.id;
    }
    // this.on('deck_change', function(e){
    //   this.change_deck(e);
    // });
    var that = this;
    this.deck.fetch({
      success: function(){
        that.nextCard(this.currentCard);
      }
    });
    //on change call render
  },

  events: {
    "click .ratings" : "gradeCard"
  },


  render: function(id){
    var front = this.deck.models[id].attributes._cardid.front;
    var back = this.deck.models[id].attributes._cardid.back;
    var deckname = this.deck.models[id].attributes._cardid.deckname;
    var context = {front: front, back: back, deckname:deckname};
    var uncompiledTemplate = $('#card').html();
    var template = Handlebars.compile(uncompiledTemplate);
    this.$el.html(template(context));
    return this;
  },

  nextCard: function(){
    if (!this.deck.models[this.currentCard]){
      alert('done');
    }
    var card = this.deck.models[0].attributes;
    if (this.needsReview(card)){
      this.render(this.currentCard);
      return;
    } else {
    this.currentCard++;
    this.nextCard();
    }
  },


  needsReview: function(card){
    var nextReviewDate = new Date(card.nextDate).setHours(0,0,0,0);
    var today = new Date().setHours(0,0,0,0);
    if (nextReviewDate <= today){
      return  true;
    }
    return false;
  },

  gradeCard: function(e){
    var grade = e.target.className;
    this.currentCard++;
    console.log(grade);
    //calcIntervalEF(card, grade)
    this.nextCard();
  },

  flip: function(){
    $('#hidden').css("visibility","visible");
  }


//   calcIntervalEF: function(card, grade) {
//   var oldEF = card.EF,
//       newEF = 0,
//       nextDate = new Date(today);
// //default date--if we don't modify it later, we should continue reviewing the card??

//   if (grade < 3) {
//     card.repetitions = 0;
//     card.interval = 0;
//     //0 means TODAY
// //if you can't remember, do it again.
//   } else {
//     newEF = oldEF + (0.1 - (5-grade)*(0.08+(5-grade)*0.02));

//     if (newEF < 1.3) { // 1.3 is the minimum EF
//       card.EF = 1.3;
//     } else {
//       card.EF = newEF;
//     }

//     card.reps = card.reps + 1;

//     switch (card.reps) {
//       case 1:
//         card.interval = 1;
//         //if it's your first time, review it tomorrow
//         break;
//       case 2:
//         card.interval = 6;
//         //if it's your second time, review it in six days 
//         break;
//       default:
//         card.interval = Math.round((card.reps - 1) * card.EF);
//         //we want to round to the day.
//         break;
//     }
//   }

//   if (grade === 3) {
//     card.interval = 0;
//     //if you had great difficulty remembering it, then review it today.
//   }

//   nextDate.setDate(today.getDate() + card.interval);
//   card.nextDate = nextDate;
//   //calculate when you should review things.
// }


});