# hapi-imageoptimizer

Image optimization proxy written in Node.js using [hapi](http://hapijs.com/).

Allows you to resize an image and change image formats. Output is always optimized for the smallest file size.

- `http://localhost:5678/cat.gif,w100` - Resize to a width of 100px
- `http://localhost:5678/cat.gif,w100,h50` - Fit into 100px &times; 50px (keeping aspect ratio)
- `http://localhost:5678/find-peace.png,jpg` - Convert PNG to JPG
- `http://localhost:5678/find-peace.png,w100,h50,jpg` - All combined


## Usage

Requires [graphicsmagick](http://www.graphicsmagick.org) to be installed (e.g. on Mac OS X via [Homebrew](http://brew.sh): `brew install graphicsmagick`).

```
npm install hapi-imageoptimizer
```

Afterwards, include `hapi-imageoptimizer` as plug-in into your existing Hapi project (a demo server can be found in `/example`):

```javascript
const Hapi = require('hapi');
const server = new Hapi.Server();

server.register({
    plugin: require('hapi-imageoptimizer'),
    options: {
        source: '/path/to/images',
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
- `cache`: Sets Hapi's [route.cache](http://hapijs.com/api#route-options) options
- `imagecache`:
    - `strategy`: Catbox caching strategy (defaults to `catbox-memory`)
    - `options`: Strategy specific options (optional)
    - `ttl`: Cache time-to-live in milliseconds (default: one hour)

The catbox strategy **must** support binary data (e.g. [`catbox-s3`](https://github.com/fhemberger/catbox-s3)), the default is `catbox-memory` with `imagecache.options.maxByteSize` set to `104857600` (100MB).


## TODO

- Write tests
- Use [cjpeg-dssim](https://github.com/technopagan/cjpeg-dssim) for JPG optimization


## License

[MIT](LICENSE)
