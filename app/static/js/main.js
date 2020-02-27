base_url = `http://${document.domain}:${location.port}`

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

    $('#rightbarCollapse').on('click', function () {
        $('#rightbar').toggleClass('active');
        let value = $('#rightbarCollapse span').text();
        if (value == "<"){
            $('#rightbarCollapse span').text('>')
        } else {
            $('#rightbarCollapse span').text('<')
        }
    });

    // Draw Scent
    date_scent = new LineScent('.noUi-target');
    date_scent.load_data();
    date_scent.draw();








});





