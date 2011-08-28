// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){
    /* Ace editor */
    var editor = ace.edit("sourcecode");
    editor.setTheme("ace/theme/textmate");

    /* Socket.io */
    var socket = io.connect();
    socket.emit('client-connect', 'ok');

    // When image arrive, display it
    socket.on('image', function(image) {
        var viewWidth = $('#imagewrapper').parent().width();
        var viewHeight = $('#imagewrapper').parent().height();

        var imageSize = resize_image(image, viewWidth, viewHeight);

        $('#imagewrapper').empty();
        $('#imagewrapper').append('<center><img src="' + image.data + '" width="' + imageSize.width + '" height="' + imageSize.height + '"/></center>');
    });

    socket.on('image-list', function(json) {
        var images = JSON.parse(json);
        $.each(images, function (i, imageName) {
            $('select#imgs').append('<option value=' + imageName + '>' + imageName + '</option>');
        });
    });

    socket.on('error', function(message) {
      // later on, we should pass the error message for logging... or not
      if (message === '') {
         console.log("Error event called with no message");
         $('a#error').text("");
       } else {
         console.log("Error: " + message);
         $('a#error').text("Error processing image");
       }
    });

    resize_image = function(image, w, h) {
        w = (h / image.height) * image.width;
        h = (w / image.width) * image.height;
        return {'width':w, 'height':h};
    }

    submitData = function() {
        var json = JSON.stringify({
          image: $('select#imgs').val(),
          sourcecode: editor.getSession().getValue()
        });
        // Emit an event to server with source code
        socket.emit('sourcecode', json);
    }

    $(document).ready(function() {

        submitData();

        $('#close-initial-message').click(function() {
            $('#initial-message').slideUp();
        });

        $('#understand-button').click(function() {
            $('#initial-message').slideUp();
        });

        // When submit code button pressed
        $('#submitcode').click(function() {
            submitData();
        });

        $('#imageinput').change(function() {
            $('#imageupload').submit();
        });

        $('#autosubmitcode').change(function() {
            if ($('#autosubmitcode').is(':checked')) {
                setInterval(function () {
                    submitData();
                }, 5000);
            }
        });

    });

    /* Backbone.js
    window.Graphic = Backbone.Model.extend({
        defaults: {
            source: '',
            image:  null
        }
    });

    window.GraphicView = Backbone.View.extend({

    });

    window.AppView = Backbone.View.extend({
        el: $("#app")
    });

    window.App = new AppView;
    */
});

