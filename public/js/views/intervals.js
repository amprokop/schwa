/* This algorithm will give each item a score that indicates the urgency of review.
After every review of a particular item, the user provides an easiness rating indicating
how well the user was able to recall the information. The easiness rating is used to calculate
an Easiness Factor(EF). Each time the user reviews the card, the last EF, the most recent easiness 
rating, and the number of past reviews are all used to calculate the next desired interval.


We will use this information in the following ways:

In the deck index, some decks will be marked "Needs review", along with the last review date.

At the end of each review session, a graph will be displayed with some stats (D3????)



Thumbs up ~> 5

Thumbs sideways ~> 2.5

Thumbs down ~> 0  

OR

red to Green gradient with six seperate boxes

*/


var intervalCalc = function(review_count, current_EF, easiness_rating){

  if (easiness_rating === 0){
    review_count = 1;
    last_easiness_factor = 2.5;
  }

  if (review_count === 1){

    return 1;
  }
  if (review_count === 2){
    return 6;
  }
  return ( intervalCalc(review_count - 1, last_easiness_factor) * easinessFactorCalc(current_EF, easiness_rating) );
};


var easinessFactorCalc = function(ef, last_response){
  new_ef = ef + (.1 - (5-last_response)) * (.08 + (5-last_response) * .02 );
  if (new_ef < 1.3){
    new_ef = 1.3;
  }
  return new_ef;
}


