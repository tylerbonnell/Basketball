var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 198;
var PIXEL_SIZE;
var players = {};
var socket;

window.onload = function() {
  document.getElementById("connect").onclick = function() {
    document.getElementById("connecting").style.display = "block";
    serverAddress = document.getElementById("connect").text || 'http://localhost:3000';
    socket = io(serverAddress);
    socket.on('connect', function() {
      document.getElementById("mainmenu").style.display = "none";
      start();
    });
  };
};

function start() {
  PIXEL_SIZE = window.innerHeight / CANVAS_HEIGHT;
  document.getElementById("all").style.backgroundColor = "#808080";

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
    addElement(playerInfo.id, "Images/player1.png", playerInfo.x, playerInfo.y);
  });
  socket.on('player leave', function(playerInfo) {
    delete players[playerInfo.id];
  });
  socket.on('update player', function(playerInfo) {
    if (!document.getElementById(playerInfo.id)) return;
    for (var playerAttr in playerInfo) {
      players[playerInfo.id][playerAttr] = playerInfo[playerAttr];
    }
    setPos(playerInfo.id, playerInfo.x, playerInfo.y)
  });

  setInterval(function() {
    console.log(players);
  }, 5000);
}

function addElement(id, url, x, y) {
  var img = new Image();
  img.onload = function() {
    players[id].width = this.width * PIXEL_SIZE + "px";
    players[id].x = x;
    players[id].y = y;
    document.getElementById("display").innerHTML += "<img src=\"" + url + "\" id=\"" + id + "\" width=\"" + players[id].width + "\"/>";
    setPos(id, x, y);
  };
  img.src = url;
}

function setPos(id, x, y) {
  document.getElementById(id).style.left = x * PIXEL_SIZE + "px";
  document.getElementById(id).style.top = y * PIXEL_SIZE + "px";
}