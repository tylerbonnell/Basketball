var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
console.log("Server started!");

app.get("/", function(req, res) {
  //res.sendFile(__dirname + '/index.html');
  res.json({a:1});
});

/*app.get('/:gameid', function(req, res) {
  //console.log("request: " + req.params.gameid);
  res.sendFile(__dirname + '/game.html');
});*/

var players = {};

io.on('connection', function(socket) {
  var info = players[socket.id] = {'keysDown':{}};
  //console.log(io.sockets.clients());
  //console.log(socket.id + " connected");
  socket.on('disconnect', function() {
    //console.log(this.id + " disconnected");
  });

  socket.on('key down', function(keyCode) {
    info.keysDown[keyCode] = null;
  });

  socket.on('key up', function(keyCode) {
    delete info.keysDown[keyCode];
  });
});

server.listen(3000);