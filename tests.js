function aws_test() {
  var spawn = require('child_process').spawn;
  
  function decode(buffer) {
      var encodedString = String.fromCharCode.apply(null, new Uint8Array(buffer));
      return decodeURIComponent(escape(encodedString));
  }
  
  var bash;
  function setupBash() {
    bash = spawn('docker', ['run', '--rm', '-i', 'ubuntu', 'bash']);
    
    bash.stdout.on('data', function(data) {
      console.log('Stdout:', decode(data));
    });
    bash.stderr.on('data', function(data) {
      console.log('Stderr:', decode(data));
    });
    bash.on('exit', function(code) {
      console.log('Exit:', code);
      setupBash();
    });
  } 
  setupBash();
  
  
  bash.stdin.write('ls\n');
  bash.stdin.write('mkdir TEST\n');
  bash.stdin.write('ls\n');
  
  bash.stdin.write('exit\n');
  
  setTimeout(function() {
    bash.stdin.write('cd TEST\n');
  }, 1000);
}
//aws_test();

function nested_node_test() {
  setInterval(function() {
    console.log('Nested node test');
  }, 2000);
}
nested_node_test();