var toArray = function(value) {
    return Array.isArray(value) ? value : [value]
}

var concatenateBuffers = function(buffer1, buffer2) {
    var size = buffer1.length + buffer2.length
    var buffer = new Buffer(size)
    buffer1.copy(buffer)
    buffer2.copy(buffer, buffer1.length)
    return buffer
}

exports.UserError = (function() {
    var UserError = function(message) {
        this.message = message
    }
    UserError.prototype = new Error
    return UserError
})()

exports.Response = function(response) {
    return {
        response: function() {
            return response
        },
        handleUserError: function(error) {
            this.handleError(new exports.UserError(error.message))
        },
        handleError: function(error) {
            var httpCode
            var message
            if (error instanceof exports.UserError) {
                httpCode = 400
                message = error.message
            } else {
                httpCode = 500
                message = "Internal error"
                console.error(error.stack)
            }
            response.send(message, { 'Content-Type': 'text/plain' }, httpCode)
        }
    }
}

/**
 * Returns a function that handles callback response and throwed errors
 *
 * - Returned values (wich will be casted to an array) are converted to a 
 *   call to handledCallback(null[, ...]). Callback isn't called when undefined
 *   is returned.
 * - Throwed errors are converted to a call to handledCallback(error)
 */
exports.handledCallback = function(handledCallback, callback) {
    return function() {
        try {
            var response = callback.apply(null, arguments)
            if (response !== undefined) {
                response = toArray(response)
                response.unshift(null) // Add error ("no error") parameter
                handledCallback.apply(null, response)
            }
        } catch (error) {
            handledCallback.call(null, error)
        }
    }
}

exports.request = function(args, callback) {
    if (! args.url) throw new exports.UserError("No URL specified")
    exports.handledCallback(callback, function() {
        require('request')(args, exports.handledCallback(callback, function(error, response, body) {
            if (error) throw error
            if (response.statusCode >= 400) throw new exports.UserError("Error " + response.statusCode)
            return [response, body]
        }))
    })()
}

exports.download = function(url, callback) {
   this.request({ url: url, encoding: 'binary' }, exports.handledCallback(callback, function(error, response, body) {
       if (error) throw error
       require('temp').open('download', exports.handledCallback(callback, function(error, file) {
           if (error) throw error
           require('fs').write(file.fd, body, null, 'binary', exports.handledCallback(callback, function(error) {
               if (error) throw error
               return [file.path, response]
           }))
       }))
   }))
}

/**
 * A child_process.exec() that accepts args
 */
exports.exec = function(command, args, callback) {
    args = toArray(args)
    var stdout = new Buffer(0)
    var stderr = new Buffer(0)
    var spawned = require('child_process').spawn(command, args)
    spawned.stdout.on('data', function(data) {
        stdout = concatenateBuffers(stdout, data)
    })
    spawned.stderr.on('data', function(data) {
        stderr = concatenateBuffers(stderr, data)
    })
    spawned.on('exit', exports.handledCallback(callback, function(code, signal) {
        if (code) throw new Error(stderr)
        return stdout
    }))
}
