# hapi-imagemin-proxy

Image optimization proxy written in Node.js using [hapi](http://hapijs.com/).

[![Build Status](https://travis-ci.org/fhemberger/hapi-imagemin-proxy.svg?branch=master)](http://travis-ci.org/fhemberger/hapi-imagemin-proxy) ![Current Version](https://img.shields.io/npm/v/hapi-imagemin-proxy.svg)

Allows you to resize an image and change image formats. Output is always optimized for the smallest file size.

- `http://localhost:5678/cat.gif,w100` - Resize to a width of 100px
- `http://localhost:5678/cat.gif,w100,h50` - Fit into 100px &times; 50px (keeping aspect ratio)
- `http://localhost:5678/find-peace.png,jpg` - Convert PNG to JPG
- `http://localhost:5678/find-peace.png,w100,h50,jpg` - All combined


## Usage

Requires [GraphicsMagick](http://www.graphicsmagick.org) to be installed (e.g. on Mac OS X via [Homebrew](http://brew.sh): `brew install graphicsmagick`).

```
npm install hapi-imagemin-proxy
```

Afterwards, include `hapi-imagemin-proxy` as plug-in into your existing Hapi project (a demo server can be found in `/example`):

```javascript
const Hapi = require('hapi');
const server = new Hapi.Server();

server.register({
    plugin: require('hapi-imagemin-proxy'),
    options: {
        source: '/path/to/images',
        cache: {},
        imageCache: {
            engine: require('catbox-memory'),
            options: {
                expiresIn: 3600000
            }
        },
        plugins: [
            imageminGm.resize(),
            imageminGm.convert(),
            imageminJpegoptim({ progressive: true, max: 75 }),
            imageminPngquant(),
            imageminGifsicle({ optimizationLevel: 3 }),
            imageminSvgo()
        ]
        // ...
    }
}, function (err) {

    if (err) {
        return {
            console.error(err);
        }
    }
});
```


## Options

- `source`: Location of the images to be served. Can be either a local path or a URL (required).
- `wreck`: When `source` is an URL, these request options are passed to [Wreck](https://github.com/hapijs/wreck#requestmethod-uri-options-callback).
- `cache`: Sets Hapi's [route.cache](http://hapijs.com/api#route-options) options
- `imagecache`:
    - `engine`: Catbox caching engine. **Must** support binary data, e.g. [`catbox-s3`](https://github.com/fhemberger/catbox-s3). Default: `require('catbox-memory')`
    - `options`: Engine specific options (optional)
        - `maxByteSize`: only for `catbox-memory`, default: `104857600` (100MB)
        - `expiresIn`: Cache time-to-live in milliseconds, default: `3600000` (one hour)
- `plugins`: Array of imagemin optimization plug-ins, defaults:

    ```
    imageminJpegoptim({ progressive: true, max: 75 }),
    imageminPngquant(),
    imageminGifsicle({ optimizationLevel: 3 }),
    imageminSvgo()
    ```


## TODO

- Use [cjpeg-dssim](https://github.com/technopagan/cjpeg-dssim) for JPG optimization


## License

[MIT](LICENSE.txt)
