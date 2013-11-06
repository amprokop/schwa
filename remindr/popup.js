$(function(){

  chrome.contextMenus.create({"title": "Flsh selected text", "contexts":"selection"});

  function

  chrome.contextMenus.onClicked.addListener(onClickHandler);

  //onClickData.selectionText
  $('#paste').click(function(){pasteSelection();});
  $('#post').click(function(){postCard();});

  function postCard(){
    var front  = $('#front').val();
    var back = $('#back').val();
    var deck = $('#deck').val();
    debugger;  
      chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
         // since only one tab should be active and in the current window at once
         // the return variable should only have one entry
         var activeTab = arrayOfTabs[0];
         var activeTabId = arrayOfTabs[0].id; // or do whatever you need
        console.log(activeTabID);
        debugger;
      });

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