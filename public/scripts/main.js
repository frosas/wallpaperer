$.fn.complete = function(callback) {
    $(this).load(function() {
        callback.call(this)
    })
    $(this).error(function(event) {
        callback.call(this, event)
    })
    return this
}

var wallpaperer = {}

wallpaperer.status = (function() {
    return {
        set: function(message) {
            $('#status .content')
                .empty()
                .append($('<div class="message">').text(message))
            $('#status').toggle(message != '')
        },
        clear: function() {
            this.set('')
        }
    }
})()

wallpaperer.transaction = (function() {
    var form = $('#image-form')
    return {
        reset: function() {
            form.data('transaction', Math.random().toString())
        },
        id: function() {
            return form.data('transaction')
        }
    }
})()

$('input[name=width]').val(screen.width)
$('input[name=height]').val(screen.height)

$('#image-form').submit(function() {

    wallpaperer.status.set('Sending request')

    wallpaperer.transaction.reset()

    var url = '/api/transform?' + $.param({
        width: $('input[name=width]').val(),
        height: $('input[name=height]').val(),
        url: $('input[name=url]').val(),
        transaction: wallpaperer.transaction.id()
    })
    var img = $('<img>')
        .attr({src: url, draggable: 'true', title: "Drag this image to your desktop to save it"})
        .hide()
        .complete(function(error) {
            wallpaperer.transaction.reset()
            if (error) return wallpaperer.status.set('Error loading image')
            $(this).show()
            wallpaperer.status.clear()
        })
    $('#image-placeholder').empty().append(img)

    return false
})

$('#search-similiar-button').click(function() {
    open('http://images.google.com/searchbyimage?' + $.param({
        image_url: $('#image-form input[name=url]').val()
    }))
})

io.connect().on('transform step', function(args) {
    if (args.transaction == wallpaperer.transaction.id()) {
        wallpaperer.status.set(args.title)
    }
})
