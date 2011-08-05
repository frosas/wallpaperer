var express = require('express'),
    utils = require('./lib/utils'),
    image = require('./lib/image')

var app = express.createServer()

app.configure(function() {
    app.use(express.static(__dirname + '/public'))
    app.set('views', __dirname + '/views')
    app.set('view engine', 'ejs')
    app.set('view options', { layout: false })
})

app.get('/', function(request, response) {
    response.render('index')
})

app.get('/api/transform', function(request, response) {

    var send = function(image) {
        response.response().contentType('image/jpeg')
        response.response().write(image)
        response.response().end()
    }

    // TODO Why response is undefined if moved inside download()?
    var response = new utils.Response(response)
    utils.download(request.param('url'), function(error, file) {
        if (error) return response.handleError(error)
        image.resizeAndCrop(file, request.param('width'), request.param('height'), function(error, image) {
            if (error) return response.handleError(error)
            send(image)
        })
    })
})

app.listen(8080)
