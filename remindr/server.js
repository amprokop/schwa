var http = require('http');
var mongoose = require('mongoose');
var db = mongoose.connection;

var port = 8080;
var ip - "127.0.0.1";


http.createServer().listen(port, ip);
console.log('Server running at http://127.0.0.1:1337/');


var requestHandler = function (req, res) {
  res.writeHead(200, defaultHeaders);
  res.end('Hello World\n');

  'POST': function(url){
  var fullBody = '';
  request.on('data',function(data){
    fullBody += data;
  });
  
  request.on('end',function(){
    if (!fullBody.length){
      respond(400, response, 'No File To Append');
    } else {
      console.log(fullBody)
    }
  });
}




var defaultHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "Content-Type":"text/html",
  "access-control-max-age": 10 // Seconds.
};

var respond = function(statusCode,){
  statusCode = statusCode || 200;
  if(!HTMLDataType){
    response.writeHead(statusCode, defaultHeaders);
    response.end(data);
  } else {
    response.writeHead(statusCode, {"Content-Type": "text/"+HTMLDataType});
    response.end(data);
  }
};