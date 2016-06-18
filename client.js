window.onload = function() {
  var socket = io('http://localhost:3000');

  // Player input
  var trackedKeys = {87:'w', 65:'a', 83:'s', 68:'d'};
  var keysDown = {};
  window.onkeydown = function(e) {
    if (!trackedKeys[e.keyCode]) return;
    if (!(e.keyCode in keysDown)) {
      keysDown[e.keyCode] = null;
      socket.emit('key down', e.keyCode);
    }
  };
  window.onkeyup = function(e) {
    if (!trackedKeys[e.keyCode]) return;
    if (e.keyCode in keysDown) {
      delete keysDown[e.keyCode];
      socket.emit('key up', e.keyCode);
    }
  };

  // Messages from server
  var players = {};
  socket.on('player join', function(playerInfo) {
    console.log(playerInfo.id);
    players[playerInfo.id] = playerInfo;
  });
  socket.on('player leave', function(playerInfo) {
    delete players[playerInfo.id];
  });


  setInterval(function() {
    document.getElementById("display").innerHTML = JSON.stringify(players);
  }, 1000);
}