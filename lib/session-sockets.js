var utils = require('./utils'),
    sessions = require('./sessions'),
    socketIo = require('socket.io')

var sockets = {}

exports.add = function(sessionId, socket) {
    sockets[sessionId] = socket
    socket.on('disconnect', function() {
        delete sockets[sessionId]
    })
}

exports.get = function(sessionId) {
    return sockets[sessionId]
}

exports.init = function(app) {

    var io = socketIo.listen(app)

    io.set('authorization', function(data, accept) {
        if (data.headers.cookie) {
            data.sessionId = sessions.idFromHeader(data.headers.cookie)
            accept(null, true)
        } else {
            accept("No cookie, no socket", false)
        }
    })

    io.sockets.on('connection', function(socket) {
        exports.add(socket.handshake.sessionId, socket)
    })
}
