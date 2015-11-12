# hapi-imageoptimizer

Proxy written in Node.js using [hapi](http://hapijs.com/).

```
npm install hapi-imageoptimizer
```


## Usage

This can be either used as standalone proxy server (you can adjust the settings in config/default.js and run it via `npm start`) or included as plug-in into your existing Hapi project:

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
