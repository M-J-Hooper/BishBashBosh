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

//called to start and restart terminal
function setupBash() {
  bash = spawn('bash');
  
  bash.stdout.on('data', function(data) {
    io.emit('message', {buffer: data, color: currentColor});
  });
  bash.stderr.on('data', function(data) {
    io.emit('message', {buffer: data, color: currentColor});
  });
  
  //when running on ec2, create container and start bash session
  bash.stdin.write('docker run --rm -i ubuntu bash\n');
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
    
    //prevent exit from docker container
    if(command == 'exit') {
      data.buffer = new Buffer('Nice try');
      io.emit('message', data);
    }
    //allow the server to be restarted
    else if(command == 'bbbdev rs') {
      bash.kill('SIGINT');
      setupBash();
      data.buffer = new Buffer('Bash restarted');
      io.emit('message', data);
    }
    //custom about command for details
    else if(command == 'about') {
      data.buffer = new Buffer('BishBashBosh\nA multi-user Linux terminal in the cloud\ngithub.com/M-J-Hooper/BishBashBosh');
      io.emit('message', data);
    }
    //all other commands executed as normal
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

var port = process.env.PORT || 3000;
serv.listen(port);
console.log('Server started on port '+port);