var express = require('express'),
    utils = require('./lib/utils'),
    imagemagick = require('imagemagick')

var app = express.createServer()

app.configure(function() {
    app.use(express.static(__dirname + '/public'))
})

app.get('/api/transform', function(request, response) {

    var fetch = function(url, callback) {
        utils.request({ url: url, encoding: 'binary' }, function(error, response, image) {
            callback(error, image)
        })
    }

    var resizeAndCrop = function(image, width, height, callback) {
        var maxWidthOrHeight = Math.max(width, height)
        var args = [
            '-', 
            '-resize', maxWidthOrHeight + 'x' + maxWidthOrHeight, 
            '-quality', 95, 
            '-gravity', 'center', 
            '-crop', width + 'x' + height + '+0+0',
            '-'
        ]
        console.log("convert " + args.join(" "))
        var proc = imagemagick.convert(args, callback)
        proc.stdin.setEncoding('binary')
        proc.stdin.write(image, 'binary')
        proc.stdin.end()
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
        resizeAndCrop(image, request.param('width'), request.param('height'), function(error, image) {
            if (error) return response.handleServerError(error)
            send(image)
        })
    })
})

app.listen(8080)
