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
            response.send(error.message, { 'Content-Type': 'text/plain' }, 400)
        },
        handleServerError: function(error) {
            response.send("Internal error", { 'Content-Type': 'text/plain' }, 500)
            console.error(error)
        }
    }
}

/**
 * Returns a function that handles callback response and throwed errors
 *
 * - Not null responses (wich value is casted to an array) are converted to a 
 *   call to handledCallback(null[, ...])
 * - Nothing is done on null responses (to only handle errors)
 * - Throwed errors are converted to a call to handledCallback(error)
 */
exports.handledCallback = function(handledCallback, callback) {
    return function() {
        var response
        try {
            response = callback.apply(null, arguments)
            response = toArray(response)
            if (response != null) {
                if (! response instanceof Array) response = [response]
                // Add error ("no error") parameter
                response.unshift(null) 
            }
        } catch (error) {
            var response = [error]
        }
        if (response != null) handledCallback.apply(null, response)
    }
}

exports.request = function(args, callback) {
    this.handledCallback(callback, function() {
        require('request')(args, this.handledCallback(callback, function(error, response, body) {
            if (error) throw error
            if (response.statusCode >= 400) throw new Error("Error " + response.statusCode)
            return [response, body]
        }))
    })()
}

/**
 * A child_process.exec() that accepts args
 */
exports.exec = function(command, args, callback) {
    if (args !== undefined) args = toArray(args)
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
