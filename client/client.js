/*global jQuery, io, randomColor*/

(function($, io, rc) {
    var color = randomColor({luminosity: 'light'});
    $('span, input').css('color', color);
    
    
    var socket = io();
    socket.emit('color', color);
    
    socket.on('message', function(message) {
        var encodedString = String.fromCharCode.apply(null, new Uint8Array(message.buffer));
        var decodedString = decodeURIComponent(escape(encodedString));
        
        console.log(message.color);
        $('div').append('<p style="color: '+message.color+';">'+decodedString+'</p>');
        window.scrollTo(0, document.body.scrollHeight);
    });
    
    
    $('form').submit(function(e){
        var input = $('input');
        socket.emit('command', input.val());
        input.val('');
        return false;
    });
    
    $('input').focus();
    
})(jQuery, io, randomColor);