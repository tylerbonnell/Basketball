var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
console.log("Server started");

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/play/:gameid', function(req, res) {
  console.log("request: " + req.params.gameid);
  res.sendFile(__dirname + '/game.html');
});

var connections = [];

io.on('connection', function(socket) {
  //console.log(io.sockets.clients());
  console.log(socket.id + " connected");
  connections.push(socket);
  socket.on('disconnect', function() {
    console.log(this.id + " disconnected");
    connections.splice(connections.indexOf(socket), 1);
  });
});

server.listen(8080);