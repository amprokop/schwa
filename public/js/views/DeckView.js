//YOU CAN'T EVER REVIEW THE LAST CARD!!

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
    "click .ratings" : "gradeCard",
    "click .flipper" : "flip"
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
    console.log("nextcalled");
    if (!this.deck.models[this.currentCard]){
      this.$el.append('<div>End of review. Continue or review your progress.</div>');
      return;
    }
    var card = this.deck.models[0].attributes;
    if (this.needsReview(card)){
      this.render(this.currentCard);
      return;
    } else {
    this.currentCard++;
    // this.nextCard();
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
    console.log("grade called");
    var grade = e.target.className;
    this.currentCard++;
    console.log(grade);
    this.calcIntervalEF(this.currentCard, grade);
    this.nextCard();
  },

  flip: function(){
    $('#hidden').css("visibility","visible");
  },

  onClose: function () {
    this.model.unbind();
    this.collection.unbind();
  },


  calcIntervalEF: function (cardID, gradeString) {
    var today = new Date();
    today.setHours(0,0,0,0);
    var card = this.deck.models[cardID].attributes;
    var oldEF = card.EF,
        newEF = 0,
        nextDate = new Date(today);
    var gradeNums = {
      zero : 0,
      one : 1,
      two : 2,
      three : 3,
      four : 4,
      five : 5
    };
    var grade = gradeNums[gradeString];
  //default date--if we don't modify it later, we should continue reviewing the card??

    if (grade < 3) {
      card.repetitions = 0;
      card.interval = 0;
      //0 means TODAY
  //if you can't remember, do it again.
    } else {
      newEF = oldEF + (0.1 - (5-grade)*(0.08+(5-grade)*0.02));

      if (newEF < 1.3) { // 1.3 is the minimum EF
        card.EF = 1.3;
      } else {
        card.EF = newEF;
      }

      card.repetitions += 1;

      switch (card.repetitions) {
        case 1:
          card.interval = 1;
          //if it's your first time, review it tomorrow
          break;
        case 2:
          card.interval = 6;
          //if it's your second time, review it in six days 
          break;
        default:
          card.interval = Math.round((card.repetitions - 1) * card.EF);
          //we want to round to the day.
          break;
      }
    }

    if (grade === 3) {
      card.interval = 0;
      //if you had great difficulty remembering it, then review it today.
    }

    nextDate.setDate(today.getDate() + card.interval);
    card.nextDate = nextDate;
    //calculate when you should review things.
    this.deck.models[cardID].attributes = card;
    this.deck.models[cardID].save(null, {
      success: function (model, response){
        console.log('saved');
      },
      error: function (model, response){
        console.log('error');
      }
    });
  }

});