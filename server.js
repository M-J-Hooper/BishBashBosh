var express = require('express');
var app = express();
var serv = require('http').Server(app);

var spawn = require('child_process').spawn;

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
    io.emit('message', {buffer: 'Look what you\'ve gone and done...\nContainer restarted!', color: currentColor});
    setupBash();
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
    
    //custom about command for details
    if(command == 'about') {
      data.buffer = new Buffer('BishBashBosh\nA multi-user Linux terminal in the cloud!\ngithub.com/M-J-Hooper/BishBashBosh');
      io.emit('message', data);
    }
    //all other commands executed as normal
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