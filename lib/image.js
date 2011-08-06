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
    this.dimensions(file, utils.handledCallback(callback, function(error, dimensions) {
        if (error) throw error

        var resizeGeometry = function() {
            var originalRatio = dimensions.width / dimensions.height
            var finalRatio = width / height
            var finalIsWiderThanOriginal = finalRatio > originalRatio
            return finalIsWiderThanOriginal ? width : 'x' + height
        }

        var args = [
            file,
            '-resize', resizeGeometry(),
            '-gravity', 'center', 
            '-crop', width + 'x' + height + '+0+0',
            '-quality', 95, 
            '-'
        ]
        // process.stderr.write("convert " + args.join(" ") + "\n")
        utils.exec('convert', args, callback)
    }))
}
