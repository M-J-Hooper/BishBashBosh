var express = require('express');
var app = express();
var serv = require('http').Server(app);

var spawn = require('child_process').spawn;
var bash;

var io = require('socket.io')(serv,{});
var socketList = {};
var currentColor = '#ffffff';



///////////////////////////////////////////////////////////////////////
//Bash interactions
///////////////////////////////////////////////////////////////////////

function setupBash() {
  bash = spawn('bash');
  
  bash.stdout.on('data', function(data) {
    io.emit('message', {buffer: data, color: currentColor});
  });
  bash.stderr.on('data', function(data) {
    io.emit('message', {buffer: data, color: currentColor});
  });
  
  bash.stdin.write('docker exec -i ubuntu_bash bash\n');
} 
setupBash();


///////////////////////////////////////////////////////////////////////
//Socket listeners
///////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function(socket) {
  socket.id = Math.random();
  socketList[socket.id] = {socket: socket, color: currentColor};
  console.log('User '+socket.id+' connected');
  
  socket.on('color', function(color) {
    socketList[socket.id].color = color;
  });
  
  socket.on('command', function(command) {
    console.log('User '+socket.id+' sent command: '+command);
    currentColor = socketList[socket.id].color;
    var data = {buffer: new Buffer('> '+command), color: currentColor};
    io.emit('message', data);
    
    if(command == 'exit') {
      data.buffer = new Buffer('Nice try');
      io.emit('message', data);
    }
    else if(command == 'bbbdev rs') {
      bash.kill('SIGINT');
      setupBash();
      data.buffer = new Buffer('Bash restarted');
      io.emit('message', data);
    }
    else if(command == 'about') {
      data.buffer = new Buffer('BishBashBosh\nA multi-user Linux terminal in the cloud\nBy Matt Hooper\ngithub.com/M-J-Hooper/BishBashBosh');
      io.emit('message', data);
    }
    else {
      bash.stdin.write(command+'\n');
    }
  });
  
  socket.on('disconnect', function() {
    delete socketList[socket.id];
    console.log('User '+socket.id+' disconnected');
  });
});



///////////////////////////////////////////////////////////////////////
//Static express setup
///////////////////////////////////////////////////////////////////////

app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

var port = 3000;
serv.listen(port);
console.log('Server started on port '+port);