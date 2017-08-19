function aws_test() {
  var spawn = require('child_process').spawn;
  var terminate = require('terminate');
  
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
  
  console.log('mkdir TEST');
  bash.stdin.write('mkdir TEST\n');
  
  setTimeout(function() {
    console.log('Kill');
    terminate(bash.pid, function() {});
  }, 1000);
  
  setTimeout(function() {
    console.log('ls');
    bash.stdin.write('ls\n');
  }, 2000);
}
aws_test();

function nested_node_test() {
  setInterval(function() {
    console.log('Nested node test');
  }, 2000);
}
//nested_node_test();