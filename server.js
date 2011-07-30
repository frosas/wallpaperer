var express = require('express'),
    utils = require('./lib/utils')

var app = express.createServer()

app.get('/api/transform', function(req, res) {
    res = new utils.Response(res)
    utils.download(req.param('url'), function(error, file, _res) {
        if (res.handleErrorAsUsersFault(error)) return
        res.response().contentType(_res.header('Content-Type'))
        res.response().sendfile(file)
    })
})

app.listen(8000)
