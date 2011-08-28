var sys = require("sys")
  , fs = require('fs')
  , express = require('express')
  , io = require('socket.io')
  , Canvas = require('canvas')
  , Image = Canvas.Image
  , exec = require("child_process").exec
  , form = require('connect-form');

var app = express.createServer(form({ keepFilename: true, keepExtensions: true, uploadDir: __dirname + '/images' }));
var server = io.listen(app);

/*
 * Node.js KnockOut
 */
require('nko')('o5nIpNA2L1YuKWrV');

/*
 * Serve static files
 */
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.get('/', function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
});

app.get('/about', function(request, response) {
    response.sendfile(__dirname + '/public/about.html');
});

/*
 * Receives uploaded images
 */
app.post('/upload', function(request, response, next) {
    request.form.complete(function(err, fields, files) {
        if (err) {
            console.log('Error: Unable to save image');
        } else {
            console.log('\nuploaded %s to %s', files.image.filename, files.image.path);
            response.redirect('back');
        }
    });
});

server.sockets.on('connection', function (socket) {

  // Send image list to client
  socket.on('client-connect', function (data) {
    console.log('Sending image list to client');

    fs.readdir(__dirname + '/images', function(err, files) {
      if (err) throw err;

      console.log(sys.inspect(files));
      socket.emit('image-list', JSON.stringify(files));
    });
  });

  // Listen for sourcecode events from client
  socket.on('sourcecode', function(data) {
    console.log('Receiving data: \n' + data);
    var json = JSON.parse(data);

    var imageName = json.image;
    var imageInput = __dirname + '/images/' + json.image;
    var imageOutput = __dirname + "/images_output/" + new Date().getTime() + imageName;
    var convert_params = imageInput + ' -' + json.sourcecode.replace(/[\s\r\n]+$/, '').replace(/\n/g, ' -').replace(/-$/, "") + " " + imageOutput;

  	console.log("Convert_params:: " + convert_params);
    console.log("Command: " + convert_params);
    child = exec("convert " + convert_params, function (error, stdout, stderr) {
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
      console.log("error: " + error);

      var marvin;

      if (error !== null) {
        socket.emit('error');
        marvin = fs.readFileSync(imageInput);
        socket.emit('error', "Error converting");
        console.log("stdout: " + stdout);
      } else {
        marvin = fs.readFileSync(imageOutput);
      }

      var image = new Image;
      image.src = marvin;
      var canvas = new Canvas(image.width, image.height);
      var ctx = canvas.getContext('2d');
      try {
        if (error === null) {
          socket.emit('error', '');
        }
        ctx.drawImage(image, 0, 0, image.width, image.height);
      } catch (err) {
        socket.emit('error', "Error Drawing");
      }

      var data = {'data':canvas.toDataURL(), 'width':image.width, 'height':image.height};
      socket.emit('image', data);
    });
  });
});

app.listen(process.env.NODE_ENV === 'production' ? 80 : 8000, function() {
  console.log('Ready');

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0)
    require('fs').stat(__filename, function(err, stats) {
      if (err) return console.log(err)
      process.setuid(stats.uid);
    });
});

