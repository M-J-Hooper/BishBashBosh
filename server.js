var express = require('express');
var app = express();
var serv = require('http').Server(app);

var spawn = require('child_process').spawn;
var bash;

var io = require('socket.io')(serv,{});
var socketList = {};
var currentColor = '#ffffff';

var dev = true;



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
  
  if(!dev) { bash.stdin.write('docker exec -it ubuntu_bash bash\n'); }
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
    io.emit('message', {buffer: new Buffer('> '+command), color: currentColor});
    
    if(command == 'exit') {
      io.emit('message', {buffer: new Buffer('Nice try'), color: currentColor});
    }
    else if(command == 'bbbdev rs') {
      bash.kill('SIGINT');
      setupBash();
      io.emit('message', {buffer: new Buffer('Bash restarted'), color: currentColor});
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

serv.listen(process.env.PORT || 1337);
console.log('Server started.');