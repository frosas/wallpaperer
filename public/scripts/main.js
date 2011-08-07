$('input[name=width]').val(screen.width)
$('input[name=height]').val(screen.height)

$('#image-form').submit(function() {
    var url = '/api/transform?' + $.param({
        width: $('input[name=width]').val(),
        height: $('input[name=height]').val(),
        url: $('input[name=url]').val()
    })
    $('#image-placeholder').html(
        $('<img>').attr({src: url})
    )
    return false
})

$('#search-similiar-button').click(function() {
    open('http://images.google.com/searchbyimage?' + $.param({
        image_url: $('#image-form :input[name=url]').val()
    }))
})

io.connect().on('transform step', function(args) {
    $('#step-placeholder').text(args.title)
})
