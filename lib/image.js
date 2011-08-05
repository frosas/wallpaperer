var utils = require('./utils.js')

exports.dimensions = function(file, callback) {
    var child = utils.exec('identify', file, utils.handledCallback(callback, function(error, stdout, stderr) {
        if (error) throw error
        var values = stdout.toString('utf-8').split(' ')
        var dimensions = values[2].split('x')
        return {
            width: dimensions[0],
            height: dimensions[1]
        }
    }))
}

exports.resizeAndCrop = function(file, width, height, callback) {
    var maxWidthOrHeight = Math.max(width, height)
    var args = [
        file + '[' + maxWidthOrHeight + 'x' + maxWidthOrHeight + '^]', // "Resize During Image Read"
        '-gravity', 'center', 
        '-crop', width + 'x' + height + '+0+0',
        '-quality', 95, 
        '-'
    ]
    // process.stderr.write("convert " + args.join(" ") + "\n")
    utils.exec('convert', args, callback)
}
