var express = require('express'),
    connect = require('connect')

var cookieName = 'sid'

exports.configure = function(app) {
    app.use(express.cookieParser())
    app.use(express.session({ 
        secret: Math.random().toString(),
        key: cookieName
    }))
}

exports.idFromHeader = function(header) {
    return connect.utils.parseCookie(header)[cookieName]
}
