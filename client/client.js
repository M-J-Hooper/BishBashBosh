/*global jQuery, io, randomColor*/

(function($, io, rc) {
    //generate new random color for user and print startup message
    var color = randomColor({luminosity: 'light'});
    $('span, input').css('color', color);
    var startMessage = 'BishBashBosh (http://github.com/M-J-Hooper/BishBashBosh)\n'
                    +'A multi-user Linux terminal in the cloud.\n'
                    +'To get started try `help\', `ls\' or `apt-get update\'.\n';
    $('div').append('<p style="color: '+color+';">'+startMessage+'</p>');
    window.scrollTo(0, document.body.scrollHeight);
    
    //connect and send color to assign to user
    var socket = io();
    socket.emit('color', color);
    
    //decode terminal output and add to DOM
    socket.on('message', function(message) {
        var encodedString = String.fromCharCode.apply(null, new Uint8Array(message.buffer));
        var decodedString = decodeURIComponent(escape(encodedString));
        
        $('div').append('<p style="color: '+message.color+';">'+decodedString+'</p>');
        window.scrollTo(0, document.body.scrollHeight);
    });
    
    //on up or down keys scroll through history of commands
    var historyPos = 0;
    var history = [];
    $(document).keydown(function(e) {
        var input = $('input');
        if(e.which == 38) { //up
            if(historyPos > 0) {
                historyPos--;
                input.val(history[historyPos]);
            }
            e.preventDefault();
        }
        if(e.which == 40) { //down
            if(historyPos + 1 < history.length) {
                historyPos++;
                input.val(history[historyPos]);
            }
            else {
                historyPos = history.length;
                input.val('');
            }
            e.preventDefault();
        }
    });
    
    //on submit check for empty command or send and add to history
    $('form').submit(function(e){
        var input = $('input');
        if(input.val().trim() == '') { input.val(''); }
        else {
            socket.emit('command', input.val());
            history.push(input.val());
            historyPos = history.length;
            input.val('');
        }
        return false;
    });
    
    $('input').focus();
    
})(jQuery, io, randomColor);