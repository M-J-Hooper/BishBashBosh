var express = require('express');
var app = express();
var serv = require('http').Server(app);

var spawn = require('child_process').spawn;
var terminate = require('terminate');

var io = require('socket.io')(serv,{});
var socketList = {};

var currentColor = '#ffffff';



///////////////////////////////////////////////////////////////////////
//Bash interactions
///////////////////////////////////////////////////////////////////////

//called to start and restart terminal
var bash;
function setupBash() {
  //bash = spawn('bash'); //when in dev
  bash = spawn('docker', ['run', '--rm', '-i', 'ubuntu', 'bash']); //when running on ec2
  
  bash.stdout.on('data', function(data) {
    io.emit('message', {buffer: data, color: currentColor});
  });
  bash.stderr.on('data', function(data) {
    io.emit('message', {buffer: data, color: currentColor});
  });
  bash.on('exit', function(code) {
    setupBash();
    var message = new Buffer('Container restarted');
    io.emit('message', {buffer: message, color: currentColor});
  });
} 
setupBash();


///////////////////////////////////////////////////////////////////////
//Socket listeners
///////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function(socket) {
  socket.id = Math.random();
  socketList[socket.id] = {socket: socket, color: currentColor};
  console.log('User '+socket.id+' connected');
  
  //assign color to user
  socket.on('color', function(color) {
    socketList[socket.id].color = color;
  });
  
  //receive command to execute from client
  socket.on('command', function(command) {
    console.log('User '+socket.id+' sent command: '+command);
    currentColor = socketList[socket.id].color;
    
    //all clients must see executed command
    var data = {buffer: new Buffer('> '+command), color: currentColor};
    io.emit('message', data);
    
    var badCommands = ['yes'];
    if(badCommands.indexOf(command) >= 0) {
      data.buffer = new Buffer('Permission denied');
      io.emit('message', data);
    }
    if(command == 'exit' || command == 'rs') { 
      terminate(bash.pid, function() {}); 
    }
    else { bash.stdin.write(command+'\n'); }
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

var port = process.env.PORT || 3000;
serv.listen(port);
console.log('Server started on port '+port);