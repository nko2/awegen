// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){
    /* Ace editor */
    var editor = ace.edit("sourcecode");
    editor.setTheme("ace/theme/textmate");
    var JavaScriptMode = require("ace/mode/javascript").Mode;
    editor.getSession().setMode(new JavaScriptMode());

    /* Socket.io */
    var socket = io.connect('http://localhost/');
    socket.emit('client-connect', 'ok');

    // When image arrive, display it
    socket.on('image', function(image) {
        console.log(image);
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

    function resize_image(image, w, h) {
        w = (h / image.height) * image.width;
        h = (w / image.width) * image.height;
        return {'width':w, 'height':h};
    }

    $(document).ready(function() {
        // When submit code button pressed
        $('#submitcode').click(function() {
            var sourcecode = $('select#imgs').val() + " -";
            sourcecode += $('#sourcecode').val().replace(/[\s\r\n]+$/, '').replace(/\n/g, ' -');
            sourcecode = sourcecode.replace(/-$/, "");
            var json = JSON.stringify({'sourcecode' : sourcecode});
            // Emit an event to server with source code
            socket.emit('sourcecode', json);
        });

        $('#imageinput').change(function() {
            alert(true);
            $('#imageupload').submit();
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

