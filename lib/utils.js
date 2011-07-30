var util = require('util'),
    request = require('request')

exports.Response = function(response) {
    var sendUserError = function(message) {
        response.send(message, { 'Content-Type': 'text/plain' }, 400)
    }
    return {
        response: function() {
            return response
        },
        handleErrorAsUsersFault: function(error) {
            if (error) {
                sendUserError(error.message)
                return true
            }
        }
    }
}

exports.request = function(args, callback) {
    require('request')(args, function(error, response, body) {
        if (error) callback(error)
        if (response.statusCode >= 400) return callback(new Error("Error " + _res.statusCode))
        callback(null, response, body)
    })
}

exports.download = function(url, callback) {
    this.request({ url: url, encoding: 'binary' }, function(error, response, body) {
        if (error) return callback(error)
        require('temp').open('download', function(error, file) {
            require('fs').write(file.fd, body, null, 'binary', function(error) {
                if (error) return callback(error)
                callback(null, file.path, response)
            })
        })
    })
}
