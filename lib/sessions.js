var cookieName = 'sid'

exports.configure = function(app) {
    var express = require('express')
    app.use(express.cookieParser())
    app.use(express.session({ 
        secret: Math.random().toString(),
        key: cookieName
    }))
}

exports.idFromHeader = function(header) {
    return require('connect').utils.parseCookie(header)[cookieName]
}
