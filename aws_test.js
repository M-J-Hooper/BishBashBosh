var spawn = require('child_process').spawn;
var bash = spawn('bash');
var devMode = false;

function decode(buffer) {
    var encodedString = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return decodeURIComponent(escape(encodedString));
}

function setupBash() {
  bash = spawn('bash');
  
  bash.stdout.on('data', function(data) {
    console.log('Stdout:', decode(data));
  });
  bash.stderr.on('data', function(data) {
    console.log('Stderr:', decode(data));
  });
  
  if(devMode) {}
  else { bash.stdin.write('docker exec -i ubuntu_bash bash\n'); }
} 
setupBash();


bash.stdin.write('ls\n');
bash.stdin.write('pwd\n');
bash.stdin.write('cd bin\n');
bash.stdin.write('pwd\n');

bash.kill('SIGINT');
setupBash();

bash.stdin.write('pwd\n');
bash.stdin.write('cd sys\n');
bash.stdin.write('pwd\n');