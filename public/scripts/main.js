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

$('input[name=width]').val(screen.width)
$('input[name=height]').val(screen.height)

$('#image-form').submit(function() {
    wallpaperer.status.set('Sending request')
    var url = '/api/transform?' + $.param({
        width: $('input[name=width]').val(),
        height: $('input[name=height]').val(),
        url: $('input[name=url]').val()
    })
    var imagePlaceholder = $('#image-placeholder')
        .empty()
        .append($('<img>').attr({src: url})
            .hide()
            .load(function() {
                $(this).show()
                wallpaperer.status.clear()
                imagePlaceholder.append($("<p>Save the image by dragging it to your desktop</p>"))
            })
            .error(function(event) {
                wallpaperer.status.set('Error loading image')
            }))
    return false
})

$('#search-similiar-button').click(function() {
    open('http://images.google.com/searchbyimage?' + $.param({
        image_url: $('#image-form input[name=url]').val()
    }))
})

io.connect().on('transform step', function(args) {
    wallpaperer.status.set(args.title)
})
