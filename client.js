var CANVAS_WIDTH = 350;
var CANVAS_HEIGHT = 80;
var PIXEL_SIZE;
var players = {};

window.onload = function() {
  PIXEL_SIZE = window.innerWidth / CANVAS_WIDTH;
  var socket = io('http://localhost:3000');

  // Player input
  var trackedKeys = {87:'w', 65:'a', 83:'s', 68:'d', 16:'shift'};
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
    if (!document.getElementById(playerInfo.id)) return;
    console.log(playerInfo);
    for (var playerAttr in playerInfo) {
      players[playerInfo.id][playerAttr] = playerInfo[playerAttr];
    }
    document.getElementById(playerInfo.id).style.left = playerInfo.x * PIXEL_SIZE + "px";
    document.getElementById(playerInfo.id).style.top = playerInfo.y * PIXEL_SIZE + "px";
  });

  setInterval(function() {
    document.getElementById("players").innerHTML = JSON.stringify(players);
  }, 100);
}

function addElement(id, url, x, y) {
  var img = new Image();
  img.onload = function() {
    players[id].width = this.width * PIXEL_SIZE + "px";
    players[id].x = x;
    players[id].y = y;
    document.getElementById("display").innerHTML += "<img src=\"" + url + "\" id=\"" + id + "\" width=\"" + players[id].width + "\"/>";
  }
  img.src = url;
}

