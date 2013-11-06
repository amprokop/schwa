  function postFlashCard(){
    debugger;
    var front  = $('#front').val();
    var back = $('#back').val();
    var deck = $('#deck').val();
    var data = {front: front, back: back, deckname: deck};
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
  $('#post').click(function(){postCard();});
