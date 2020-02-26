// // Establish Connection
// var socket = io.connect(base_url);
// socket.on('connect', function() {
//     console.log('Websocket connected!');
// });

$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        let value = $('#sidebarCollapse span').text();
        if (value == "<"){
            $('#sidebarCollapse span').text('>')
        } else {
            $('#sidebarCollapse span').text('<')
        }
    });
});



