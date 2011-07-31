var express = require('express'),
    utils = require('./lib/utils')

var app = express.createServer()

app.get('/api/transform', function(request, response) {

    var fetch = function(url, callback) {
        utils.request({ url: url, encoding: 'binary' }, function(error, response, image) {
            callback(error, image)
        })
    }

    var resize = function(image, width, height, callback) {
        require('imagemagick').resize({ srcData: image, width: width, height: height, quality: '0.95' }, callback)
    }

    var send = function(image) {
        response.response().contentType('image/jpeg')
        response.response().write(image, 'binary')
        response.response().end()
    }

    // TODO Why response is undefined if moved inside fetch()?
    var response = new utils.Response(response)
    fetch(request.param('url'), function(error, image) {
        if (error) return response.handleUserError(error)
        resize(image, request.param('width'), request.param('height'), function(error, image) {
            if (error) return response.handleServerError(error)
            send(image)
        })
    })
})

app.listen(8080)
