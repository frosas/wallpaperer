var toArray = function(value) {
    return Array.isArray(value) ? value : [value]
}

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
