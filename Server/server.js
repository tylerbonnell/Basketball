var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
console.log("Server started!");

app.get("/", function(req, res) {
  res.json({a:1});
});

/*app.get('/:gameid', function(req, res) {
  //console.log("request: " + req.params.gameid);
  res.sendFile(__dirname + '/game.html');
});*/

var players = {};

io.on('connection', function(socket) {
  var playerInfo = {
    'id': socket.id,
    'x': 0,
    'y': 0,
  }
  for (var playerKey in players) {
    // Let other players know about the new player
    io.sockets.connected[playerKey].emit('player join', playerInfo);
    // Let the new player know about other players
    io.sockets.connected[socket.id].emit('player join', players[playerKey].positionInfo);
  }

  // Add the new player to their client
  io.sockets.connected[socket.id].emit('player join', playerInfo);

  // Save the position info for the new player
  players[socket.id] = {'keysDown':{}, 'positionInfo':playerInfo};

  socket.on('disconnect', function() {
    delete players[this.id];
    for (var playerKey in players) {
      io.sockets.connected[playerKey].emit('player leave', {
        'id': this.id,
      });
    }
  });

  socket.on('key down', function(keyCode) {
    players[socket.id].keysDown[keyCode] = null;
    //socket.emit('update player', players[socket.id].positionInfo);
  });

  socket.on('key up', function(keyCode) {
    delete players[socket.id].keysDown[keyCode];
  });
});

// GAME LOOP
setInterval(function() {
  for (var playerKey in players) {
    var moveDist = 2;
    var sprintMultiplier = 2;
    if (16 in players[playerKey].keysDown) moveDist *= sprintMultiplier;
    var originalX = players[playerKey].positionInfo.x;
    var originalY = players[playerKey].positionInfo.y;
    players[playerKey].positionInfo.x += (68 in players[playerKey].keysDown) ? moveDist : 0;
    players[playerKey].positionInfo.x -= (65 in players[playerKey].keysDown) ? moveDist : 0;
    players[playerKey].positionInfo.y += (83 in players[playerKey].keysDown) ? moveDist : 0;
    players[playerKey].positionInfo.y -= (87 in players[playerKey].keysDown) ? moveDist : 0;
    var moved = players[playerKey].positionInfo.x != originalX || players[playerKey].positionInfo.y != originalY;
    if (moved) {
      io.emit('update animation', {id:playerKey, state:"running"});
    } else {
      io.emit('update animation', {id:playerKey, state:"standing"});
    }
    io.emit('update player pos', players[playerKey].positionInfo);
  }
}, 1000/24);

server.listen(3000);
