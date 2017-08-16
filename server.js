var express = require('express');
var app = express();
var serv = require('http').Server(app);

var spawn = require('child_process').spawn;
var bash = spawn('bash');

var io = require('socket.io')(serv,{});
var socketList = {};





///////////////////////////////////////////////////////////////////////
//Bash interactions
///////////////////////////////////////////////////////////////////////

bash.stdout.on('data', function(data) {
  console.log('Stdout:', data);
  io.emit('message', data);
});

bash.stderr.on('data', function(data) {
  console.log('Stderr:', data);
  io.emit('message', data);
});

bash.on('exit', function (code) {
  console.log('Exit:', code);
  io.emit('message', 'Shell exited: '+code);
});




///////////////////////////////////////////////////////////////////////
//Socket listeners
///////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function(socket) {
  socket.id = Math.random();
  socketList[socket.id] = socket;
  console.log("User "+socket.id+" connected");
  
  socket.on('command', function(data) {
    console.log("User "+socket.id+" sent command: "+data);
    bash.stdin.write(data+"\n");
    io.emit('message', new Buffer("> "+data));
  });
  
  socket.on('disconnect', function() {
    delete socketList[socket.id];
    console.log("User "+socket.id+" disconnected");
  });
});



///////////////////////////////////////////////////////////////////////
//Socket listeners
///////////////////////////////////////////////////////////////////////

app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 1337);
console.log("Server started.");