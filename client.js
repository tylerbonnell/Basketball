window.onload = function() {
  var socket = io('http://localhost:3000');

  var trackedKeys = {87:'w', 65:'a', 83:'s', 68:'d'};
  var keysDown = [];

  window.onkeydown = function(e) {
    if (!trackedKeys[e.keyCode]) return;
    if (keysDown.indexOf(e.keyCode) < 0) {
      keysDown.push(e.keyCode);
      console.log("local log of keydown: " + e.keyCode);
      socket.emit('some message', 'server log of keydown');
    }
  }

  window.onkeyup = function(e) {
    if (!trackedKeys[e.keyCode]) return;
    var index = keysDown.indexOf(e.keyCode);
    if (index >= 0) {
      keysDown.splice(index, 1);
      console.log("local log of keyup");
      socket.emit('some message', 'server log of keyup');
    }
  }
}