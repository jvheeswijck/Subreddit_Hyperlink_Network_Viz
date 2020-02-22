// Establish Connection
var socket = io.connect(base_url);
socket.on('connect', function() {
    console.log('Websocket connected!');
});

