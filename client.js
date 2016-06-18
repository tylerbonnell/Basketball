var CANVAS_WIDTH = 200;
var CANVAS_HEIGHT = 80;
var players = {};

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
  socket.on('player join', function(playerInfo) {
    players[playerInfo.id] = playerInfo;
    addElement(playerInfo.id, "Images/player.png", playerInfo.x, playerInfo.y);
  });
  socket.on('player leave', function(playerInfo) {
    delete players[playerInfo.id];
  });
  socket.on('update player', function(playerInfo) {
    for (var playerAttr in playerInfo) {
      players[playerInfo.id][playerAttr] = playerInfo[playerAttr];
    }
    document.getElementById(playerInfo.id).style.left = 100 / CANVAS_WIDTH * playerInfo.x + "%";
  });

  setInterval(function() {
    document.getElementById("players").innerHTML = JSON.stringify(players);
  }, 100);
}

function addElement(id, url, x, y) {
  var img = new Image();
  img.onload = function() {
    players[id].width = 100 / CANVAS_WIDTH * this.width + "%";
    players[id].x = x;
    players[id].y = y;
    document.getElementById("display").innerHTML += "<img src=\"" + url + "\" id=\"" + id + "\" width=\"" + players[id].width + "\"/>";
  }
  img.src = url;
}

