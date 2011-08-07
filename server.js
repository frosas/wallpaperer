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

    var notifyStep = function(title) {
        var id = request.session.id
        if (id) sessionSockets.emit(id, 'transform step', { title: title })
    }

    var send = function(image, callback) {
        response.response().contentType('image/jpeg')
        response.response().end(image)
        callback()
    }

    // TODO Why response is undefined if moved inside download()?
    var response = new utils.Response(response)
    notifyStep('Downloading')
    utils.download(request.param('url'), function(error, file) {
        if (error) return response.handleError(error)
        notifyStep('Resizing and cropping')
        image.resizeAndCrop(file, request.param('width'), request.param('height'), function(error, image) {
            if (error) return response.handleError(error)
            notifyStep('Sending')
            send(image, function() {
                notifyStep('Done')
            })
        })
    })
})

sessionSockets.init(app)

app.listen(8080)
