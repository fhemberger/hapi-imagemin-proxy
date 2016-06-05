'use strict';

const Fs = require('fs');
const Url = require('url');
const Path = require('path');
const Boom = require('boom');
const Wreck = require('wreck');
const Hoek = require('hoek');
const promisePipe = require('promise.pipe');


// Default optimization plugins
const imageminGm = require('imagemin-gm');
const imageminJpegoptim = require('imagemin-jpegoptim');
const imageminPngquant  = require('imagemin-pngquant');
const imageminGifsicle  = require('imagemin-gifsicle');
const imageminSvgo      = require('imagemin-svgo');


const internals = {
    defaults: {
        plugins: [
            imageminJpegoptim({ progressive: true, max: 75 }),
            imageminPngquant(),
            imageminGifsicle({ optimizationLevel: 3 }),
            imageminSvgo()
        ]
    }
};

internals.isLocal = (path) => !/^https?:\/\//.test(path);


exports.fullPath = (basePath, filename) => {

    if (internals.isLocal(basePath) ) {
        return Path.join(basePath, filename);
    }

    const parsed = Url.parse(basePath);
    const path = Path.join(parsed.path, filename);
    const auth = parsed.auth ? `${parsed.auth}@` : '';

    return `${parsed.protocol}//${auth}${parsed.host}${path}`;
};


/* eslint-disable hapi/hapi-scope-start */
exports.get = (image, wreckOptions) => (new Promise((resolve, reject) => {

    if (internals.isLocal(image)) {
        return Fs.readFile(image, (err, payload) => {

            return err ?
                reject(Boom.wrap(err, err.code === 'ENOENT' ? 404 : 500)) :
                resolve(payload);
        });
    }

    Wreck.get(image, wreckOptions, (err, res, payload) => {

        if (!err && res.statusCode !== 200) {
            err = Boom.create(res.statusCode, image);
        }

        return err ? reject(err) : resolve(payload);
    });
}));
/* eslint-enable hapi/hapi-scope-start */


exports.optimize = (input, options) => {

    const opts = Hoek.applyToDefaults(internals.defaults, options);

    if (opts.format) {
        opts.plugins.unshift(imageminGm.convert(opts.format));
    }

    if (opts.width || opts.height) {
        opts.plugins.unshift(imageminGm.resize({
            width   : opts.width,
            height  : opts.height,
            gravity : 'Center'
        }));
    }

    return opts.plugins.length > 0 ? promisePipe(opts.plugins)(input) : Promise.resolve(input);
};
