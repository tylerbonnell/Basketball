var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 198;
var FRAMERATE = 200;
var PIXEL_SIZE;
var LEFT_OFFSET;
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
  setInterval(animate, FRAMERATE);

  document.getElementById("display").style.display = "block";
  resize();
  window.onresize = resize;

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
    addElement(playerInfo.id, "Images/player1_0.png", playerInfo.x, playerInfo.y);
    setAnimationState({id:playerInfo.id, state:"standing"});
  });
  socket.on('player leave', function(playerInfo) {
    delete players[playerInfo.id];
  });
  socket.on('update player pos', function(playerInfo) {
    if (!document.getElementById(playerInfo.id)) return;
    setPos(playerInfo.id, playerInfo.x, playerInfo.y)
  });
  socket.on('update animation', function(state) {
    setAnimationState(state);
  });

  /*setInterval(function() {
    console.log(players);
  }, 5000);*/
}

function setAnimationState(state) {
  if (players[state.id].animationState == state.state) return;
  players[state.id].animationState = state.state;
  console.log("set state to " + state.state);
  if (state.state == "standing") {
    var frames = ["Images/player1_0.png"];
  } else if (state.state == "running") {
    var frames = ["Images/player1_1.png", "Images/player1_0.png"];
  }
  players[state.id].animationFrames = frames;
  players[state.id].animationCurrentFrame = 0;
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
  document.getElementById(id).style.left = LEFT_OFFSET + x * PIXEL_SIZE + "px";
  document.getElementById(id).style.top = y * PIXEL_SIZE + "px";
}

function resize() {
  PIXEL_SIZE = window.innerHeight / CANVAS_HEIGHT;
  LEFT_OFFSET = Math.floor((window.innerWidth - CANVAS_WIDTH * PIXEL_SIZE) / 2)
  document.getElementById("bg").style.left = LEFT_OFFSET + "px";
  for (var key in players) {
    setPos(players[key].id, players[key].x, players[key].y);
  }
}

function animate() {
  for (var key in players) {
    var dom = document.getElementById(players[key].id);
    if (!dom) return;
    //console.log(players[key].animationFrames);

    dom.src = players[key].animationFrames[players[key].animationCurrentFrame];
    players[key].animationCurrentFrame = (players[key].animationCurrentFrame + 1) %
        players[key].animationFrames.length;
  }
}