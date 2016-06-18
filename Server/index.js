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

/*var players;
if (!players) {
  players = {};
}*/
var players = {};

io.on('connection', function(socket) {
  // Let all other players know that this player joined
  for (var playerKey in players) {
    io.sockets.connected[playerKey].emit('player join', {
      'id': socket.id,
    });
  }

  players[socket.id] = {'keysDown':{}};
  var info = players[socket.id];

  // Let the new player know about all the other players
  for (var playerKey in players) {
    io.sockets.connected[socket.id].emit('player join', {
      'id': playerKey,
    });
  }

  socket.on('disconnect', function() {
    delete players[this.id];
    for (var playerKey in players) {
      io.sockets.connected[playerKey].emit('player leave', {
        'id': this.id,
      });
    }
  });

  socket.on('key down', function(keyCode) {
    info.keysDown[keyCode] = null;
  });

  socket.on('key up', function(keyCode) {
    delete info.keysDown[keyCode];
  });
});

server.listen(3000);