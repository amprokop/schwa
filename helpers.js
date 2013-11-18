exports.wordAPIOutputParser = function(dictObj){
    var output = [],
        traverse = function(input){
        if (typeof input !== 'object'){
                return;
        }      
        for (var key in input){
            if (key === "FirstTranslation" || key === "SecondTranslation" || key === "ThirdTranslation" || key === "FourthTranslation"){
                output.push({'term' : input[key]['term'], 'sense' : input[key]['sense']});
                console.log('pushing');
            } else {
                traverse(input[key]);
            }
        }
    };   
  traverse(dictObj);
  return output;
};


exports.definitionObjectParser = function(obj){
    var i = 0,
        parsed = [];
    while (obj[i.toString()] ) {
        if(obj['sense ' + i]){
            parsed.push( obj['term ' + i]    + ' (' + obj['sense ' + i] + ')'  );
        } else {
            parsed.push( obj['term ' + i] );   
        }
      i++;
    }
    return parsed;
};
