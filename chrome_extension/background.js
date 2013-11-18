function onClickHandler(info, tab){
  var postUrl = 'http://sink-in.herokuapp.com/chrome/new_card/card?text='+encodeURIComponent('"'+info.selectionText+'"')+'&url='+info.pageUrl;
  chrome.windows.create({"url":postUrl, "type":"popup", "height":300,"width":600, "top": 100, "left":100});
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

var contexts = ["page","selection","link","image"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i],
      title = "Make flash card from " + context,
      id = chrome.contextMenus.create({"title": title, "contexts":[context], "id": context});
}

chrome.browserAction.onClicked.addListener(function(tab) {
  var postUrl = "http://sink-in.herokuapp.com/chrome/";
  chrome.windows.create({"url":postUrl, "type":"popup", "height":300,"width":600, "top": 100, "left":100});
});