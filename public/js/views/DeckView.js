//TODO: Fix bug--currentCard increments by number of Views?

Schwa.DeckView = Backbone.View.extend({
  model: Schwa.Deck,

  initialize: function(){
    this.currentCard = 0;
    this.deck = new Schwa.Deck();
  },

  events: {
    "click td.grade" : "gradeCard",
    "click .flipper" : "flip"
  },

  startReview: function(){
    console.log('dfsuifpbsdai')
    var decks = this.deck.models;
    this.currentCard = 0;
    this.endOfReviewReached = false;
    this.endOfDeckReached = false;
    this.sortByReviewDate(decks);
  },

  sortByReviewDate: function(decks){
    var compare = function(a,b){
      if (a.attributes.nextDate > b.attributes.nextDate){return 1};
      if (a.attributes.nextDate < b.attributes.nextDate){return -1};
      return 0;
    }
    decks.sort(compare);
    this.nextCard();
  },   

  nextCard: function(){
    if (this.currentCard === this.deck.models.length && !this.endOfDeckReached){
      this.$el.prepend('<span id="endAddendum"> End of deck. </span>');
      this.endOfDeckReached = true;
      return;
    }
    var card = this.deck.models[this.currentCard].attributes;
    if (!this.needsReview(card) && !this.endReached){
      this.$el.prepend('<span class="endMessage"> End of review. Continue or check out your progress!</span>');
      this.endOfReviewReached = true;
    }
    this.render(this.currentCard);
  },

  render: function(id){
    console.log('render called');
    var front = this.deck.models[id].attributes._cardid.front;
    var back = this.deck.models[id].attributes._cardid.back;
    var deckname = this.deck.models[id].attributes._cardid.deckname;
    var context = {front: front, back: back, deckname:deckname};
    var uncompiledTemplate = $('#card').html();
    var template = Handlebars.compile(uncompiledTemplate);
    this.$el.html(template(context));
    return this;
  },

  needsReview: function(card){
    var nextReviewDate = card.nextDate;
    var today = new Date().setHours(0,0,0,0);
    if (nextReviewDate <= today){
      return true;
    }
    return false;
  },

  gradeCard: function(e){
    if (!this.deck.models[this.currentCard]){ 
      return;
    }
    var card = this.deck.models[this.currentCard].attributes;
    debugger;
    if (!this.needsReview(card)){
      console.log('card not graded--it doesn\'t need review!')
    } else {
      console.log('')
      var grade = e.target.className;
      this.calculateEF(this.currentCard, grade);
    }
    this.currentCard++;
    this.nextCard();
  },

  flip: function(){
    $('#hidden').css("visibility","visible");
  },

  calculateEF: function (cardID, gradeString) {
    if (!this.deck.models[cardID]){
      return;
    }
    var today = new Date().setHours(0,0,0,0);
    var card = this.deck.models[cardID].attributes;
    var oldEF = card.EF,
        newEF = 0,d
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

    card.nextDate = today + (card.interval * 24 * 60 * 60 * 1000);
    //
    //calculate when you should review things.
    this.deck.models[cardID].attributes = card;
    this.deck.models[cardID].save(null, {
      success: function (model, response){
        console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  card saved\n', model );
      },
      error: function (model, response){
        console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\nerror', model );
      }
    });
  }

});