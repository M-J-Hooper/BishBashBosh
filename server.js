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
    io.emit('message', data);
  });
  bash.stderr.on('data', function(data) {
    io.emit('message', data);
  });
  bash.on('exit', function (code) {
    io.emit('message', 'Look what you\'ve gone and done! ('+code+')');
  });
  
  if(!dev) { bash.stdin.write('docker exec -it ubuntu_bash bash\n'); }
} 
setupBash();


///////////////////////////////////////////////////////////////////////
//Socket listeners
///////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function(socket) {
  socket.id = Math.random();
  socketList[socket.id] = socket;
  console.log('User '+socket.id+' connected');
  
  socket.on('command', function(data) {
    console.log('User '+socket.id+' sent command: '+data);
    io.emit('message', new Buffer('> '+data));
    
    if(data == 'exit') {
      io.emit('message', new Buffer('Nice try'));
    }
    else if(data == 'bbbdev rs') {
      bash.kill('SIGINT');
      setupBash();
      io.emit('message', new Buffer('Bash restarted'));
    }
    else {
      bash.stdin.write(data+'\n');
    }
  });
  
  socket.on('disconnect', function() {
    delete socketList[socket.id];
    console.log('User '+socket.id+' disconnected');
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
console.log('Server started.');