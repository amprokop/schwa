$(function(){

  $('#paste').click(function(){pasteSelection();});
  $('#post').click(function(){postCard();});

  function postCard(){
    var front  = $('#front').val();
    var back = $('#back').val();
    var deck = $('#deck').val();
    var bg = chrome.extension.getBackgroundPage();
    bg.postCard(front, back, deck);
  }
});


var pasteSelection = function () {
  console.log('pasteSel called');
  chrome.tabs.query({active:true, windowId: chrome.windows.WINDOW_ID_CURRENT},
  function(tab) {
    chrome.tabs.sendMessage(tab[0].id, {method: "getSelection"},
    function(response){
      var text = document.getElementById('front');
      text.innerHTML = response.data;
    });
  });
};