/*global jQuery, io*/

(function($, io) {
    function addData(str){
        console.log(str);
        $('div').append('<p>' + str + '</p>');
        window.scrollTo(0,document.body.scrollHeight);
    }
    
    var socket = io();
    socket.on('message', function(data) {
        var encodedString = String.fromCharCode.apply(null, new Uint8Array(data));
        var decodedString = decodeURIComponent(escape(encodedString));
        addData(decodedString);
    });
    
    
    $('form').submit(function(e){
        var input = $('input');
        socket.emit('command', input.val());
        input.val('');
        return false;
    });
    
    $('input').focus();
    
})(jQuery, io);