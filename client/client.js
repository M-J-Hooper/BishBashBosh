/*global jQuery, io, randomColor*/

(function($, io, rc) {
    var color = randomColor({luminosity: 'light'});
    $('span, input').css('color', color);
    
    
    var socket = io();
    socket.emit('color', color);
    
    socket.on('message', function(message) {
        var encodedString = String.fromCharCode.apply(null, new Uint8Array(message.buffer));
        var decodedString = decodeURIComponent(escape(encodedString));
        
        $('div').append('<p style="color: '+message.color+';">'+decodedString+'</p>');
        window.scrollTo(0, document.body.scrollHeight);
    });
    
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