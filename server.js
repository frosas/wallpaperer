var express = require('express'),
    utils = require('./lib/utils'),
    image = require('./lib/image'),
    sessions = require('./lib/sessions'),
    sessionSockets = require('./lib/session-sockets')

var app = express.createServer()

app.configure(function() {

    app.use(express.static(__dirname + '/public'))

    app.set('views', __dirname + '/views')
    app.set('view engine', 'ejs')
    app.set('view options', { layout: false })

    sessions.configure(app)
})

app.get('/', function(request, response) {
    response.render('index')
})

app.get('/api/transform', function(request, response) {

    var setStatus = function(title) {
        var socket = sessionSockets.get(request.session.id)
        if (socket) socket.emit('transform step', {title: title})
    }

    setStatus('Downloading')
    utils.download(request.param('url'), function(error, file) {
        if (error) return new utils.Response(response).handleError(error)
        setStatus('Resizing and cropping')
        image.resizeAndCrop(file, request.param('width'), request.param('height'), function(error, image) {
            if (error) return new utils.Response(response).handleError(error)
            setStatus('Sending')
            response.contentType('image/jpeg')
            response.end(image)
        })
    })
})

sessionSockets.init(app)

app.listen(8080)
