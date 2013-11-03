function postCard(front, back, deck){
  debugger;
  var data = {front: front, back: back, deck: deck};
  var url = 'http://localhost:8080/';
  $.ajax({
    url:url,
    type:"POST",
    data:JSON.stringify(data),
    contentType:"application/json; charset=utf-8",
    dataType:"json",
    success: function(){
      console.log('posted', data);
      }
  });
}