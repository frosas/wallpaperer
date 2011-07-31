exports.Response = function(response) {
    return {
        response: function() {
            return response
        },
        handleUserError: function(error) {
            response.send(error.message, { 'Content-Type': 'text/plain' }, 400)
        },
        handleServerError: function(error) {
            response.send("Internal error", { 'Content-Type': 'text/plain' }, 500)
            console.error(error.message)
        }
    }
}

exports.request = function(args, callback) {
    try {
        require('request')(args, function(error, response, body) {
            if (error) callback(error)
            if (response.statusCode >= 400) return callback(new Error("Error " + _res.statusCode))
            callback(null, response, body)
        })
    } catch (error) {
        callback(error)
    }
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
