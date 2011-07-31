var express = require('express'),
    utils = require('./lib/utils')

var app = express.createServer()

app.get('/api/transform', function(request, response) {

    var fetchImage = function (url, callback) {
        utils.request({ url: url, encoding: 'binary' }, function(error, response2, data) {
            callback(error, data)
        })
    }

    var resizeImage = function(data, width, height, callback) {
        require('imagemagick').resize({ 
            srcData: data, 
            width: width,
            height: height,
            quality: '0.95'
        }, callback)
    }

    // TODO Why response is undefined if moved inside fetchImage()?
    var response = new utils.Response(response)
    fetchImage(request.param('url'), function(error, data) {
        if (error) return response.handleUserError(error)
        resizeImage(data, request.param('width'), request.param('height'), function(error, data) {
            if (error) return response.handleServerError(error)
            response.response().contentType('image/jpeg')
            response.response().write(data, 'binary')
            response.response().end()
        })
    })
})

app.listen(8080)
