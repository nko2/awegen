// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){
  var socket = io.connect('http://localhost/');
  socket.emit('client-connect', 'ok');

  // When image arrive, display it
  socket.on('image', function(json) {
    $('#imagewrapper').empty();
    $('#imagewrapper').append(json);
    //var json = JSON.parse(data);
    console.log(json);
  });

  socket.on('image-list', function(json) {
    var images = JSON.parse(json);
    $.each(images, function (i, imageName) {
      $('select#imgs').append('<option value=' + imageName + '>' + imageName + '</option>');
    });
  });

  $(document).ready(function() {
    // When submit code button pressed
    $('#submitcode').click(function() {
      var sourcecode = $('select#imgs').val() + " -";
      sourcecode += $('#sourcecode').val().replace(/[\s\r\n]+$/, '').replace(/\n/g, ' -');
      console.log(sourcecode)
      sourcecode = sourcecode.replace(/-$/, "");
      var json = JSON.stringify({'sourcecode' : sourcecode});
      // Emit an event to server with source code
      socket.emit('sourcecode', json);
    });
  });
  
  /*
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

