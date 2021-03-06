# Wallpaperer

## Features

- Image is resized and cropped (if necessary) to fit the desired size
- Desktop size is automatically detected
- Search for similar images (uses Google Images)

## TODO

- Download button
  - File name: {$originalName}-{$width}x{$height}.jpg
- Bookmarklet
- Cache downloaded image
- Cache final image
- A nice UI
- Allow resizing/cropping visually
- Allow editing from Picnik
- Allow upload file
- Unit and functional tests
- Detect multiple screens
- Android 2.3 browser give random screen dimensions
- Test it with Chrome, Firefox, Safari, Opera, iPhone & iPad

## Installation and execution

It requires node.js (http://nodejs.org), npm (http://npmjs.org) and ImageMagick (http://imagemagick.org)

```bash
$ git clone git://github.com/frosas/wallpaperer.git
$ cd wallpaperer
$ npm install
$ node server.js
```

Now you can use it at http://localhost:8080/
