var express = require('express'),
    utils = require('./lib/utils')

var app = express.createServer()

app.get('/api/transform', function(request, response) {
    response = new utils.Response(response)
    utils.download(request.param('url'), function(error, file) {
        if (error) return response.handleUserError(error)
        var resizedFile = '/tmp/resized'
        require('imagemagick').resize({ 
            srcPath: file, 
            dstPath: resizedFile, 
            quality: '0.95', 
            width: request.param('width'),
            height: request.param('height')
        }, function(error) {
            if (error) return response.handleServerError(error)
            response.response().contentType('image/jpeg')
            response.response().sendfile(resizedFile)
        })
    })
})

app.listen(8000)
